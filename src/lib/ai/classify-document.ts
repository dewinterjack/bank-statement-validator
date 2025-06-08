import { documentClassificationSchema } from '@/lib/validation/schemas';
import { generateDocumentAnalysis } from './generate-document-analysis';

const SYSTEM_MESSAGE = `You are a document classifier. Your job is to analyze a document and determine if it is a bank statement or not. 

A bank statement typically contains:
- Account holder information (name, address)
- Account number
- Statement period (start and end dates)
- Opening and closing balances
- List of transactions with dates, descriptions, and amounts
- Bank branding/letterhead

Be thorough in your analysis and provide a confidence score based on how certain you are about the classification.`;

const USER_MESSAGE_TEXT =
  'Analyze this document and determine if it is a bank statement. Provide your confidence level and reasoning.';

export async function classifyDocument(fileData: string, fileMimeType: string) {
  return generateDocumentAnalysis({
    systemMessage: SYSTEM_MESSAGE,
    userMessage: USER_MESSAGE_TEXT,
    schema: documentClassificationSchema,
    fileData,
    fileMimeType,
  });
}
