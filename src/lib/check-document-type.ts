import { documentTypeSchema } from '@/lib/schemas';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

export async function checkDocumentType(
  fileData: string,
  fileMimeType: string,
) {
  return generateObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    messages: [
      {
        role: 'system',
        content: `You are a document classifier. Your job is to analyze a document and determine if it is a bank statement or not. 

A bank statement typically contains:
- Account holder information (name, address)
- Account number
- Statement period (start and end dates)
- Opening and closing balances
- List of transactions with dates, descriptions, and amounts
- Bank branding/letterhead

Be thorough in your analysis and provide a confidence score based on how certain you are about the classification.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this document and determine if it is a bank statement. Provide your confidence level and reasoning.',
          },
          { type: 'file', data: fileData, mimeType: fileMimeType },
        ],
      },
    ],
    schema: documentTypeSchema,
  });
}
