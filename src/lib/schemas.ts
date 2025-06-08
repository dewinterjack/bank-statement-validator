import type { DeepPartial } from 'ai';
import { z } from 'zod';
import {
  aiValidationSchema,
  calculatedValidationSchema,
} from './validation/schemas';

export const transactionSchema = z.object({
  date: z.string().datetime(),
  description: z.string(),
  amount: z.number(),
  balance: z.number().optional(),
  type: z.enum(['credit', 'debit']),
});

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

export const analysisResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  aiValidations: z.array(aiValidationSchema),
  calculatedValidations: z.array(calculatedValidationSchema),
  bankStatement: bankStatementSchema.partial().nullable(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type BankStatement = z.infer<typeof bankStatementSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// Partial types for streaming responses
export type PartialTransaction = DeepPartial<Transaction>;
export type PartialBankStatement = DeepPartial<BankStatement>;
