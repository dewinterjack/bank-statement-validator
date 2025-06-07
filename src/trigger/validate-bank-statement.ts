import { s3Client } from '@/lib/s3-client';
import { generateBankStatementObject } from '@/lib/generate-bank-statement-object';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { logger, task } from '@trigger.dev/sdk/v3';

export const validateBankStatementTask = task({
  id: 'validate-bank-statement',
  maxDuration: 300,
  run: async (payload: { s3Key: string }, { ctx }) => {
    logger.log('Downloading pdf from bucket', { payload, ctx });
    const getObjectCommand = new GetObjectCommand({
      Bucket: 'pdfs',
      Key: payload.s3Key,
    });

    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      throw new Error('No response from S3');
    }

    const pdfBuffer = Buffer.from(await response.Body.transformToByteArray());

    const result = await generateBankStatementObject(
      pdfBuffer.toString('base64'),
      'application/pdf',
    );

    logger.log('Generated bank statement object', { result });

    return { result };
  },
});
