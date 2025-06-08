import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { documentLegibilitySchema } from './schemas';

export async function checkDocumentLegibility(
  fileData: string,
  fileMimeType: string,
) {
  return generateObject({
    model: google('gemini-2.5-flash-preview-05-20'),
    messages: [
      {
        role: 'system',
        content: `You are a document quality analyzer. Your job is to assess the legibility and quality of uploaded documents to determine if they are suitable for OCR processing and data extraction.

Analyze the document for these common quality issues:

**Flash reflections or glare**: Bright spots or reflective areas that obscure text or data
**Motion blur or camera shake**: Blurred text due to movement during capture
**Low resolution or compression artifacts**: Pixelated, grainy, or heavily compressed images
**Cropped or cut-off sections**: Missing edges, borders, or important document sections
**Overexposed or underexposed lighting**: Too bright (washed out) or too dark areas
**Obscured or tampered fields**: Stickers, fingers, overlays, or suspicious modifications covering data

Perform these verification checks:
- Is the image sharp and legible throughout?
- Are all required fields visible and unobstructed?
- Are there signs of visual tampering (e.g., glare strategically placed to obscure data)?
- Does the file meet reasonable resolution and format requirements for OCR processing?

Be thorough and specific in identifying issues and their locations within the document.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this document for quality and legibility issues. Check if it meets the standards for reliable OCR processing and data extraction.',
          },
          { type: 'file', data: fileData, mimeType: fileMimeType },
        ],
      },
    ],
    schema: documentLegibilitySchema,
  });
}
