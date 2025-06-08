import type { z } from 'zod';
import {
  aiValidationSchema,
  baseAIValidationSchema,
  type BaseAIValidation,
} from './schemas';

export type BaseValidationInput = BaseAIValidation & Record<string, unknown>;

/**
 * Metadata for validations, providing human-readable titles and descriptions.
 * This should be extended as new validation types are added.
 */
export const validationMetadata = {
  'document-classification': {
    title: 'Document Classification',
    description: 'Verifies that the uploaded document is a bank statement.',
  },
  'legibility-issue': {
    title: 'Legibility Check',
    description:
      'Checks the document for any legibility issues that might prevent data extraction.',
  },
};

export type ValidationName = keyof typeof validationMetadata;

/**
 * Converts a validation object into an AI Validation object.
 * Fields from the input that are not part of the baseAIValidationSchema
 * are moved into the `additionalDetails` property.
 *
 * @param input The raw validation result object.
 * @param name The name of the validation to look up metadata.
 * @returns An object conforming to the `aiValidationSchema`.
 */
export function toAiValidation(
  input: BaseValidationInput,
  name: ValidationName,
): z.infer<typeof aiValidationSchema> {
  const { passed, confidence, reasoning, ...additionalDetails } =
    baseAIValidationSchema.passthrough().parse(input);

  const metadata = validationMetadata[name];

  const result = {
    passed,
    confidence,
    reasoning,
    title: metadata.title,
    description: metadata.description,
    additionalDetails:
      Object.keys(additionalDetails).length > 0 ? additionalDetails : undefined,
  };

  return aiValidationSchema.parse(result);
}
