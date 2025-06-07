import { s3Client } from '@/lib/s3-client';
import { generateBankStatementObject } from '@/lib/generate-bank-statement-object';
import { checkDocumentType } from '@/lib/check-document-type';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { logger, task } from '@trigger.dev/sdk/v3';
import { validateBankStatement } from '@/lib/validators';
import type { ValidationResult } from '@/lib/schemas';
import { db } from '@/server/db';

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

    const documentTypeResult = await documentTypeCheck.triggerAndWait({
      pdf: pdfBuffer.toString('base64'),
    });

    if (!documentTypeResult.ok) {
      throw new Error('Document type check failed', {
        cause: documentTypeResult.error,
      });
    }
    const docTypeOutput = documentTypeResult.output.result;

    validations.push({
      check: 'Document Type',
      status: docTypeOutput.isBankStatement ? 'PASS' : 'FAIL',
      message: docTypeOutput.isBankStatement
        ? `Document identified as a bank statement with ${Math.round(
            docTypeOutput.confidence * 100,
          )}% confidence.`
        : `Document is not a bank statement. Detected as: ${docTypeOutput.documentType}.`,
      confidence: docTypeOutput.confidence,
      details: { reasoning: docTypeOutput.reasoning },
    });

    if (docTypeOutput.confidence < 0.7 && docTypeOutput.isBankStatement) {
      validations.push({
        check: 'Document Confidence',
        status: 'WARN',
        message: `Low confidence (${Math.round(
          docTypeOutput.confidence * 100,
        )}%) in classification. Please review carefully.`,
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

    const result = await generateBankStatementObject(
      pdfBuffer.toString('base64'),
      'application/pdf',
    );
    const extractedStatement = result.object;

    validations.push({
      check: 'Data Extraction',
      status: 'PASS',
      message: 'Successfully extracted data from the document.',
    });

    const reconciliationResults = validateBankStatement(extractedStatement);
    validations.push(...reconciliationResults);

    const overallStatus = validations.some((v) => v.status === 'FAIL')
      ? 'FAILED'
      : 'COMPLETED';

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
      validations.push({
        check: 'Database Save',
        status: 'FAIL',
        message: 'Failed to save extracted statement data to the database.',
        details: (error as Error).message,
      });
      await db.statementAnalysis.update({
        where: { id: payload.analysisId },
        data: { status: 'FAILED', validations: validations },
      });
      return { analysisId: payload.analysisId, status: 'FAILED' };
    }
  },
});
