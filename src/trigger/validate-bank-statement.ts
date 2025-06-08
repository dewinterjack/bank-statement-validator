import { s3Client } from '@/lib/s3-client';
import { extractBankStatement } from '@/lib/ai/extract-bank-statement';
import { classifyDocument } from '@/lib/ai/classify-document';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { batch, logger, metadata, task } from '@trigger.dev/sdk/v3';
import { validateBankStatement } from '@/lib/validation/validators';
import type {
  AIValidation,
  CalculatedValidation,
} from '@/lib/validation/schemas';
import { db } from '@/server/db';
import { analyzeDocumentQuality } from '@/lib/ai/analyze-document-quality';
import { toAiValidation } from '@/lib/validation/result-parsing';

export const analyzeDocumentQualityTask = task({
  id: 'analyze-document-quality',
  maxDuration: 120,
  run: async (payload: { pdf: string }, { ctx }) => {
    logger.log('Starting document legibility analysis', { payload, ctx });

    const result = await analyzeDocumentQuality(payload.pdf, 'application/pdf');

    logger.log('Document legibility analysis complete', {
      result: result.object,
    });

    return {
      result: result.object,
    };
  },
});

export const classifyDocumentTask = task({
  id: 'classify-document',
  maxDuration: 120,
  run: async (payload: { pdf: string }, { ctx }) => {
    logger.log('Starting document classification', { payload, ctx });

    const result = await classifyDocument(payload.pdf, 'application/pdf');

    logger.log('Document classification complete', { result: result.object });

    return {
      result: result.object,
    };
  },
});

export const validateBankStatementTask = task({
  id: 'validate-bank-statement',
  maxDuration: 300,
  run: async (payload: { s3Key: string; analysisId: string }, { ctx }) => {
    const analysis = await db.statementAnalysis.create({
      data: {
        status: 'PROCESSING',
        s3Key: payload.s3Key,
      },
    });

    logger.log('Starting bank statement validation workflow', { payload, ctx });

    const aiValidations: AIValidation[] = [];
    const calculatedValidations: CalculatedValidation[] = [];

    const getObjectCommand = new GetObjectCommand({
      Bucket: 'pdfs',
      Key: payload.s3Key,
    });
    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      await db.statementAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
        },
      });
      throw new Error('No response from S3');
    }
    const pdfBuffer = Buffer.from(await response.Body.transformToByteArray());

    metadata.set('currentStep', 'Performing initial validations');
    const {
      runs: [legibilityResult, typeResult],
    } = await batch.triggerByTaskAndWait([
      {
        task: analyzeDocumentQualityTask,
        payload: { pdf: pdfBuffer.toString('base64') },
      },
      {
        task: classifyDocumentTask,
        payload: { pdf: pdfBuffer.toString('base64') },
      },
    ]);

    if (!typeResult.ok) {
      throw new Error('Document type check failed', {
        cause: typeResult.error,
      });
    }
    const classificationResult = typeResult.output.result;

    if (!legibilityResult.ok) {
      throw new Error('Document legibility check failed', {
        cause: legibilityResult.error,
      });
    }
    const legibilityResults = legibilityResult.output.result;

    aiValidations.push(
      toAiValidation(classificationResult, 'document-classification'),
    );

    if (classificationResult.passed === false) {
      await db.statementAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
          validations: {
            create: aiValidations.map((validation) => ({
              confidence: validation.confidence,
              passed: validation.passed,
              reasoning: validation.reasoning,
              title: validation.title,
              description: validation.description,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              additionalDetails: validation.additionalDetails,
            })),
          },
        },
      });
      return {
        aiValidations,
        calculatedValidations,
        status: 'FAILED',
      };
    }

    legibilityResults.forEach((legibilityIssue) => {
      aiValidations.push(toAiValidation(legibilityIssue, 'legibility-issue'));
    });

    metadata.set('currentStep', 'Extracting data');
    const result = await extractBankStatement(
      pdfBuffer.toString('base64'),
      'application/pdf',
    );
    const extractedStatement = result.object;

    metadata.set('currentStep', 'Validating data');
    calculatedValidations.push(...validateBankStatement(extractedStatement));

    const overallStatus =
      aiValidations.some((v) => v.passed === false) ||
      calculatedValidations.some((v) => v.passed === false)
        ? 'FAILED'
        : 'COMPLETED';

    metadata.set('currentStep', 'Finishing up');
    try {
      // Only create the BankStatement if the core validations didn't hard-fail
      const bankStatement = await db.bankStatement.create({
        data: {
          accountHolderName: extractedStatement.accountHolder.name,
          accountHolderAddress: extractedStatement.accountHolder.address,
          startDate: new Date(extractedStatement.startDate),
          endDate: new Date(extractedStatement.endDate),
          accountNumber: extractedStatement.accountNumber,
          startingBalance: extractedStatement.startingBalance,
          endingBalance: extractedStatement.endingBalance,
          currency: extractedStatement.currency,
          transactions: {
            create: extractedStatement.transactions.map((tx) => ({
              date: new Date(tx.date),
              description: tx.description,
              amount: tx.amount,
              balance: tx.balance,
              type: tx.type,
            })),
          },
        },
      });

      await db.statementAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: overallStatus,
          validations: {
            create: aiValidations.map((validation) => ({
              confidence: validation.confidence,
              passed: validation.passed,
              reasoning: validation.reasoning,
              title: validation.title,
              description: validation.description,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              additionalDetails: validation.additionalDetails,
            })),
          },
          calculatedValidations: {
            create: calculatedValidations.map((validation) => ({
              passed: validation.passed,
              reasoning: validation.reasoning,
              title: validation.title,
              description: validation.description,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              additionalDetails: validation.additionalDetails,
            })),
          },
          bankStatementId: bankStatement.id,
        },
      });

      return {
        aiValidations,
        calculatedValidations,
        bankStatement: {
          ...extractedStatement,
          id: bankStatement.id,
        },
        status: overallStatus,
      };
    } catch (error) {
      logger.error('Failed to save bank statement to DB', { error });
      await db.statementAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
          validations: {
            create: aiValidations.map((validation) => ({
              confidence: validation.confidence,
              passed: validation.passed,
              reasoning: validation.reasoning,
              title: validation.title,
              description: validation.description,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              additionalDetails: validation.additionalDetails,
            })),
          },
          calculatedValidations: {
            create: calculatedValidations.map((validation) => ({
              passed: validation.passed,
              reasoning: validation.reasoning,
              title: validation.title,
              description: validation.description,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              additionalDetails: validation.additionalDetails,
            })),
          },
        },
      });
      return {
        aiValidations,
        calculatedValidations,
        status: 'FAILED',
      };
    }
  },
});
