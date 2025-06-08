import { s3Client } from '@/lib/s3-client';
import { generateBankStatementObject } from '@/lib/generate-bank-statement-object';
import { checkDocumentType } from '@/lib/check-document-type';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { batch, logger, metadata, task } from '@trigger.dev/sdk/v3';
import { validateBankStatement } from '@/lib/validators';
import type { ValidationResult } from '@/lib/schemas';
import { db } from '@/server/db';
import { checkDocumentLegibility } from '@/lib/check-document-legibility';

export const documentLegibilityCheck = task({
  id: 'document-legibility-check',
  maxDuration: 120,
  run: async (payload: { pdf: string }, { ctx }) => {
    logger.log('Starting document legibility analysis', { payload, ctx });

    const result = await checkDocumentLegibility(
      payload.pdf,
      'application/pdf',
    );

    logger.log('Document legibility analysis complete', {
      result: result.object,
    });

    return {
      result: result.object,
    };
  },
});

export const documentTypeCheck = task({
  id: 'document-type-check',
  maxDuration: 120,
  run: async (payload: { pdf: string }, { ctx }) => {
    logger.log('Starting document type analysis', { payload, ctx });

    const result = await checkDocumentType(payload.pdf, 'application/pdf');

    logger.log('Document type analysis complete', { result: result.object });

    return {
      result: result.object,
    };
  },
});

export const validateBankStatementTask = task({
  id: 'validate-bank-statement',
  maxDuration: 300,
  run: async (payload: { s3Key: string; analysisId: string }, { ctx }) => {
    await db.statementAnalysis.create({
      data: {
        id: payload.analysisId,
        status: 'PROCESSING',
        s3Key: payload.s3Key,
      },
    });

    logger.log('Starting bank statement validation workflow', { payload, ctx });

    const validations: ValidationResult[] = [];

    const getObjectCommand = new GetObjectCommand({
      Bucket: 'pdfs',
      Key: payload.s3Key,
    });
    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      throw new Error('No response from S3');
    }
    const pdfBuffer = Buffer.from(await response.Body.transformToByteArray());

    metadata.set('currentStep', 'Confirming document legibility');
    const {
      runs: [legibilityResult, typeResult],
    } = await batch.triggerByTaskAndWait([
      {
        task: documentLegibilityCheck,
        payload: { pdf: pdfBuffer.toString('base64') },
      },
      {
        task: documentTypeCheck,
        payload: { pdf: pdfBuffer.toString('base64') },
      },
    ]);

    if (!typeResult.ok) {
      throw new Error('Document type check failed', {
        cause: typeResult.error,
      });
    }
    const docTypeOutput = typeResult.output.result;

    if (!legibilityResult.ok) {
      throw new Error('Document legibility check failed', {
        cause: legibilityResult.error,
      });
    }
    const legibilityOutput = legibilityResult.output.result;

    validations.push(
      {
        check: 'Document Type',
        status: docTypeOutput.isBankStatement ? 'PASS' : 'FAIL',
        message: docTypeOutput.isBankStatement
          ? 'Document identified as a bank statement'
          : `Document is not a bank statement.`,
        confidence: docTypeOutput.confidence,
        details: { reasoning: docTypeOutput.reasoning },
      },
      {
        check: 'Document Legibility',
        status: legibilityOutput.isLegible ? 'PASS' : 'FAIL',
        message: legibilityOutput.isLegible
          ? 'Document is legible'
          : 'Document is not legible',
        confidence: legibilityOutput.overallConfidence,
        details: {
          reasoning: legibilityOutput.qualityIssues
            .map((issue) => issue.description)
            .join(', '),
        },
      },
    );

    if (docTypeOutput.confidence < 0.7 && docTypeOutput.isBankStatement) {
      validations.push({
        check: 'Document Confidence',
        status: 'WARN',
        message: 'Low confidence in classification. Please review carefully.',
        confidence: docTypeOutput.confidence,
        details: { reasoning: docTypeOutput.reasoning },
      });
    }

    if (!docTypeOutput.isBankStatement) {
      await db.statementAnalysis.update({
        where: { id: payload.analysisId },
        data: { status: 'FAILED', validations: validations },
      });
      return { validations, status: 'FAILED' };
    }

    metadata.set('currentStep', 'Extracting data');
    const result = await generateBankStatementObject(
      pdfBuffer.toString('base64'),
      'application/pdf',
    );
    const extractedStatement = result.object;

    metadata.set('currentStep', 'Validating data');
    const reconciliationResults = validateBankStatement(extractedStatement);
    validations.push(...reconciliationResults);

    const overallStatus = validations.some((v) => v.status === 'FAIL')
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
        where: { id: payload.analysisId },
        data: {
          status: overallStatus,
          validations: validations,
          bankStatementId: bankStatement.id,
        },
      });

      return {
        validations: validations,
        bankStatement: {
          ...extractedStatement,
          id: bankStatement.id,
        },
        status: overallStatus,
      };
    } catch (error) {
      logger.error('Failed to save bank statement to DB', { error });
      await db.statementAnalysis.update({
        where: { id: payload.analysisId },
        data: { status: 'FAILED', validations: validations },
      });
      return { analysisId: payload.analysisId, status: 'FAILED' };
    }
  },
});
