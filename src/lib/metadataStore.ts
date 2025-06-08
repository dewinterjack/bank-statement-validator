import { metadata } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

const BankStatementValidationStatus = z.object({
  progress: z.number(),
  label: z.string(),
});

type BankStatementValidationStatus = z.infer<
  typeof BankStatementValidationStatus
>;

const BankStatementValidationMetadata = z.object({
  status: BankStatementValidationStatus,
});

type BankStatementValidationMetadata = z.infer<
  typeof BankStatementValidationMetadata
>;

export function updateStatus(status: BankStatementValidationStatus) {
  // `metadata.set` can be used to update the status of the task
  // as long as `updateStatus` is called within the task's `run` function.
  metadata.set('status', status);
}

export function parseStatus(data: unknown): BankStatementValidationStatus {
  return BankStatementValidationMetadata.parse(data).status;
}
