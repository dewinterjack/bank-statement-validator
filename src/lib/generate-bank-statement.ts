import { bankStatementSchema } from '@/lib/schemas';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

export async function generateBankStatement(
  fileData: string,
  fileMimeType: string,
) {
  const result = await generateObject({
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
  });

  return { result: result.object, usage: result.usage };
}
