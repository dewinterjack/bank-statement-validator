import { bankStatementSchema } from '@/lib/schemas';
import { generateDocumentAnalysis } from './generate-document-analysis';

const SYSTEM_MESSAGE =
  'You are a bank statement extractor. Your job is to take a document, and extract the bank statement from the document.';

const USER_MESSAGE_TEXT = 'Extract the bank statement from the document.';

export async function generateBankStatementObject(
  fileData: string,
  fileMimeType: string,
) {
  return generateDocumentAnalysis({
    systemMessage: SYSTEM_MESSAGE,
    userMessage: USER_MESSAGE_TEXT,
    schema: bankStatementSchema,
    fileData,
    fileMimeType,
  });
}
