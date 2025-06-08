import type { DeepPartial } from 'ai';
import { z } from 'zod';

export const validationStatusSchema = z.enum(['PASS', 'FAIL', 'WARN']);

export const validationResultSchema = z.object({
  check: z.string().describe('The name of the validation check performed.'),
  status: validationStatusSchema,
  message: z.string().describe('A human-readable message about the result.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Confidence score, if applicable.'),
  details: z
    .any()
    .optional()
    .describe('Any extra data relevant to the validation.'),
});

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
  validations: z.array(validationResultSchema),
  bankStatement: bankStatementSchema.partial().nullable(),
});

export const documentClassificationSchema = z.object({
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

export const documentLegibilitySchema = z.object({
  isLegible: z
    .boolean()
    .describe('Whether the document is legible and suitable for processing'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Overall confidence in the legibility assessment'),
  qualityIssues: z.array(
    z.object({
      issue: z
        .enum([
          'flash_reflections_glare',
          'motion_blur_camera_shake',
          'low_resolution_compression',
          'cropped_cut_off_sections',
          'overexposed_underexposed',
          'obscured_tampered_fields',
          'other',
        ])
        .describe('Type of quality issue detected'),
      severity: z
        .enum(['low', 'medium', 'high'])
        .describe('Severity of the issue'),
      description: z
        .string()
        .describe('Detailed description of the specific issue'),
      affectedData: z
        .array(z.string())
        .describe('Which data is affected by the issue'),
    }),
  ),
  verificationChecks: z.object({
    allFieldsVisible: z
      .boolean()
      .describe('Are all required fields visible and unobstructed?'),
    noVisualTampering: z
      .boolean()
      .describe(
        'No signs of visual tampering like strategically placed glare?',
      ),
  }),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type BankStatement = z.infer<typeof bankStatementSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ValidationStatus = z.infer<typeof validationStatusSchema>;

// Partial types for streaming responses
export type PartialTransaction = DeepPartial<Transaction>;
export type PartialBankStatement = DeepPartial<BankStatement>;
