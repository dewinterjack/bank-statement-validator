import { s3Client } from '@/lib/s3-client';
import { generateBankStatementObject } from '@/lib/generate-bank-statement-object';
import { checkDocumentType } from '@/lib/check-document-type';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { logger, task } from '@trigger.dev/sdk/v3';
import { validateBankStatement } from '@/lib/validators';

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
  run: async (payload: { s3Key: string }, { ctx }) => {
    logger.log('Starting bank statement validation workflow', { payload, ctx });

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

    const documentTypeOutput = documentTypeResult.output.result;

    if (!documentTypeOutput.isBankStatement) {
      const error = `Document is not a bank statement. Detected as: ${documentTypeOutput.documentType} (confidence: ${documentTypeOutput.confidence})`;
      logger.error(error, {
        reasoning: documentTypeOutput.reasoning,
      });
      return {
        message: error,
        validation: {
          isBankStatement: false,
          confidence: documentTypeOutput.confidence,
          reasoning: documentTypeOutput.reasoning,
        },
      };
    }

    if (documentTypeOutput.confidence < 0.7) {
      logger.warn('Low confidence in bank statement classification', {
        confidence: documentTypeOutput.confidence,
        reasoning: documentTypeOutput.reasoning,
      });
    }

    logger.log(
      'Document confirmed as bank statement, proceeding with extraction',
      {
        confidence: documentTypeOutput.confidence,
        reasoning: documentTypeOutput.reasoning,
      },
    );

    const result = await generateBankStatementObject(
      pdfBuffer.toString('base64'),
      'application/pdf',
    );

    logger.log('Bank statement extraction complete', {
      result: result.object,
      usage: result.usage,
    });

    const validationErrors = validateBankStatement(result.object);

    return { result: result.object, validationErrors };
  },
});
