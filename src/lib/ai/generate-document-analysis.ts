import { google } from '@ai-sdk/google';
import { generateObject, type GenerateObjectResult } from 'ai';
import type { z } from 'zod';

interface DocumentAnalysisOptions<T extends z.ZodSchema> {
  systemMessage: string;
  userMessage: string;
  schema: T;
  fileData: string;
  fileMimeType: string;
  arrayOutput?: boolean;
}

type DocumentAnalysisResult<T extends z.ZodSchema> = Promise<
  GenerateObjectResult<z.infer<T>>
>;

export async function generateDocumentAnalysis<T extends z.ZodSchema>({
  systemMessage,
  userMessage,
  schema,
  fileData,
  fileMimeType,
}: DocumentAnalysisOptions<T>): DocumentAnalysisResult<T> {
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
  }) as DocumentAnalysisResult<T>;
}
