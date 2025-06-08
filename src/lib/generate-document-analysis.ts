import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import type { z } from 'zod';

interface DocumentAnalysisOptions<T extends z.ZodType> {
  systemMessage: string;
  userMessage: string;
  schema: T;
  fileData: string;
  fileMimeType: string;
}

export async function generateDocumentAnalysis<T extends z.ZodType>({
  systemMessage,
  userMessage,
  schema,
  fileData,
  fileMimeType,
}: DocumentAnalysisOptions<T>) {
  return generateObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessage,
          },
          { type: 'file', data: fileData, mimeType: fileMimeType },
        ],
      },
    ],
    schema,
  });
}
