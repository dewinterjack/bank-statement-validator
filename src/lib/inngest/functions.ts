import { PutObjectCommand } from '@aws-sdk/client-s3';
import { generateBankStatement } from '@/lib/generate-bank-statement';
import { s3Client } from '@/lib/s3-client';
import { inngest } from './client';
import { db } from '@/server/db';
import { bankStatementSchema, type BankStatement } from '../schemas';
import { scanRunChannel } from './channels';

export const scanPdf = inngest.createFunction(
  { id: 'scan-pdf' },
  { event: 'scan/pdf.uploaded' },
  async ({ event, step, publish }) => {
    const { data } = event as {
      data: {
        s3Key: string;
        file: { data: string; mimeType: string };
        runId: string;
      };
    };
    const { s3Key, file, runId } = data;

    await step.run('upload-pdf', async () => {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'pdfs',
          Key: s3Key,
          Body: Buffer.from(file.data, 'base64'),
          ContentType: file.mimeType,
        }),
      );
      return { success: true };
    });

    const output = await step.run('extract-pdf', async () => {
      try {
        const { result, usage } = await generateBankStatement(
          file.data,
          file.mimeType,
        );
        console.log('token usage:', usage);
        await publish(
          scanRunChannel(runId).scan({
            response: result,
            success: true,
          }),
        );
        return { success: true, data: result, usage };
      } catch (error) {
        console.error('Error generating bank statement:', error);
        return { success: false, error: error };
      }
    });

    const validatedOutput = await step.run('validate-output', async () => {
      // @ts-expect-error - output.data will be validated here
      const parsedObject = bankStatementSchema.safeParse(output.data);
      if (!parsedObject.success) {
        console.error('Error parsing bank statement:', parsedObject.error);
        return { success: false, error: parsedObject.error };
      }
      return { success: true, data: parsedObject.data };
    });

    await step.run('save-to-db', async () => {
      const { data: parsedObject } = validatedOutput as {
        data: BankStatement;
      };
      try {
        const bankStatement = await db.bankStatement.create({
          data: {
            accountHolderName: parsedObject.accountHolder.name,
            accountHolderAddress: parsedObject.accountHolder.address,
            documentDate: new Date(parsedObject.documentDate),
            accountNumber: parsedObject.accountNumber,
            startingBalance: parsedObject.startingBalance,
            endingBalance: parsedObject.endingBalance,
            currency: parsedObject.currency,
            s3Key,
            transactions: {
              create: parsedObject.transactions.map((transaction) => ({
                date: new Date(transaction.date),
                description: transaction.description,
                amount: transaction.amount,
                balance: transaction.balance,
                type: transaction.type,
              })),
            },
          },
        });
        return { success: true, data: { bankStatementId: bankStatement.id } };
      } catch (error) {
        console.error('Error saving bank statement to db:', error);
        return { success: false, error: error };
      }
    });
  },
);
