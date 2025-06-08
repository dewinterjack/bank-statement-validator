import { z } from 'zod';

export const baseAIValidationSchema = z.object({
  passed: z.boolean().describe('Whether the validation check passed.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Overall confidence in the assessed pass/fail, from 0 to 1.'),
  reasoning: z
    .string()
    .describe('A brief, high-level summary explaining the decision.'),
});

export const documentClassificationSchema = baseAIValidationSchema.extend({
  passed: z.boolean().describe('Whether the document is a bank statement.'),
  documentType: z
    .string()
    .describe(
      'The type of document detected (e.g., "bank statement", "invoice", "receipt", "other")',
    ),
});

export const legibilityIssueSchema = baseAIValidationSchema.extend({
  passed: z
    .boolean()
    .describe('Whether the issue prevents extracting key data.'),
  code: z
    .enum([
      'flash_reflections_glare',
      'motion_blur_camera_shake',
      'low_resolution_compression',
      'cropped_cut_off_sections',
      'overexposed_underexposed',
      'other',
    ])
    .describe('A machine-readable code for the specific issue.'),
  affectedData: z
    .string()
    .describe(
      'Which data is affected by the issue (e.g., "account number", "account holder name")',
    ),
});

export const calculatedValidationSchema = z.object({
  passed: z.boolean(),
  reasoning: z.string(),
  additionalDetails: z.any().optional(),
  title: z.string(),
  description: z.string().optional(),
});

export const aiValidationSchema = z.object({
  confidence: z.number(),
  passed: z.boolean(),
  reasoning: z.string(),
  title: z.string(),
  description: z.string().optional(),
  additionalDetails: z.any().optional(),
});

export const legibilityIssuesSchema = z.array(legibilityIssueSchema);
export type BaseAIValidation = z.infer<typeof baseAIValidationSchema>;
export type CalculatedValidation = z.infer<typeof calculatedValidationSchema>;
export type AIValidation = z.infer<typeof aiValidationSchema>;
