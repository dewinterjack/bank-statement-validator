import type { DeepPartial } from 'ai';
import { z } from 'zod';

export const transactionSchema = z.object({
  date: z.string().datetime(),
  description: z.string(),
  amount: z.number(),
  balance: z.number(),
  type: z.enum(['credit', 'debit']),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type PartialTransaction = DeepPartial<Transaction>;

export const bankStatementSchema = z.object({
  accountHolder: z.object({
    name: z.string(),
    address: z.array(z.string()),
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  accountNumber: z.string(),
  startingBalance: z.number(),
  endingBalance: z.number(),
  currency: z
    .string()
    .describe('The ISO 4217 currency code of the bank statement')
    .length(3, 'Currency code must be 3 characters long'),
  transactions: z.array(transactionSchema),
});

export type BankStatement = z.infer<typeof bankStatementSchema>;
export type PartialBankStatement = DeepPartial<BankStatement>;

export const documentTypeSchema = z.object({
  isBankStatement: z
    .boolean()
    .describe('Whether the document is a bank statement'),
  confidence: z.number().min(0).max(1).describe('Confidence level from 0 to 1'),
  documentType: z
    .string()
    .describe(
      'The type of document detected (e.g., "bank statement", "invoice", "receipt", "other")',
    ),
  reasoning: z
    .string()
    .describe('Brief explanation of why this classification was made'),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
