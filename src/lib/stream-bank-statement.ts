import { bankStatementSchema } from '@/lib/schemas';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function extractBankStatement(
  fileData: string,
  fileMimeType: string,
  options?: {
    s3Key?: string;
  },
) {
  return streamObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    messages: [
      {
        role: 'system',
        content:
          'You are a bank statement extractor. Your job is to take a document, and extract the bank statement from the document.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract the bank statement from the document.',
          },
          { type: 'file', data: fileData, mimeType: fileMimeType },
        ],
      },
    ],
    schema: bankStatementSchema,
    onFinish: async ({ object }) => {
      if (!options?.s3Key) {
        console.log('No s3Key provided, skipping DB save');
        const parsedObject = bankStatementSchema.safeParse(object);
        if (!parsedObject.success) {
          console.error('Error parsing bank statement:', parsedObject.error);
          throw new Error('Error parsing bank statement');
        }
        return;
      }
      const parsedObject = bankStatementSchema.parse(object);

      try {
        await prisma.bankStatement.create({
          data: {
            accountHolderName: parsedObject.accountHolder.name,
            accountHolderAddress: parsedObject.accountHolder.address,
            startDate: new Date(parsedObject.startDate),
            endDate: new Date(parsedObject.endDate),
            accountNumber: parsedObject.accountNumber,
            startingBalance: parsedObject.startingBalance,
            endingBalance: parsedObject.endingBalance,
            currency: parsedObject.currency,
            s3Key: options.s3Key,
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
      } catch (error) {
        console.error('Error saving bank statement to DB:', error);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
