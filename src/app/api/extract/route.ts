import { bankStatementSchema } from '@/lib/schemas';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json(); 
  const firstFile = files[0].data;

  const result = streamObject({
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
          {
            type: 'file',
            data: firstFile,
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
    schema: bankStatementSchema,

    onFinish: ({ object }) => {
      console.log(object);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return result.toTextStreamResponse();
}
