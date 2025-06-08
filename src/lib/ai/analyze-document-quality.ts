import { bankStatementSchema } from '@/lib/schemas';
import { legibilityIssueSchema } from '@/lib/validation/schemas';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

const SYSTEM_MESSAGE = `You are a document quality analyzer for bank statements. Your job is to assess the legibility and quality of uploaded bank statement documents to determine if they are suitable for extracting the following key data fields:

**Bank statement schema:**
${JSON.stringify(bankStatementSchema.shape, null, 2)}

**IMPORTANT**: When no issues are detected, return an empty array. Only flag quality issues that prevent extraction of these key data fields. Minor quality issues that don't affect the readability of essential data should not be flagged.

Analyze the document for these quality issues that could prevent key data extraction:

**Flash reflections or glare**: Bright spots or reflective areas that obscure key data fields
**Motion blur or camera shake**: Blurred text that makes key data fields unreadable
**Low resolution or compression artifacts**: Pixelation or compression that makes key data fields illegible
**Cropped or cut-off sections**: Missing document sections containing required data fields
**Overexposed or underexposed lighting**: Lighting issues that make key data fields unreadable
**Obscured or tampered fields**: Obstructions covering essential data fields

Only report issues that would prevent reliable extraction of these specific data points. Do not flag minor quality issues that don't impact the readability of essential bank statement information.`;

const USER_MESSAGE_TEXT =
  'Analyze this bank statement document for quality issues that would prevent extraction of key data fields. Focus only on issues that affect the readability of essential bank statement information required for data extraction.';

export async function analyzeDocumentQuality(
  fileData: string,
  fileMimeType: string,
) {
  return generateObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    output: 'array',
    messages: [
      {
        role: 'system',
        content: SYSTEM_MESSAGE,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: USER_MESSAGE_TEXT,
          },
          { type: 'file', data: fileData, mimeType: fileMimeType },
        ],
      },
    ],
    schema: legibilityIssueSchema,
  });
}
