import type { BankStatement, ValidationResult } from './schemas';

export function validateBankStatement(
  statement: BankStatement,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const totalTransactions = statement.transactions.reduce(
    (sum, transaction) => {
      if (transaction.type === 'credit') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    },
    0,
  );

  const balanceDifference = statement.endingBalance - statement.startingBalance;
  // small epsilon for floating point comparison
  if (Math.abs(totalTransactions - balanceDifference) > 0.01) {
    results.push({
      check: 'Balance Reconciliation',
      status: 'FAIL',
      message: `Transaction sum (${totalTransactions.toFixed(2)}) does not match balance change (${balanceDifference.toFixed(2)}).`,
      details: {
        calculatedChange: totalTransactions,
        reportedChange: balanceDifference,
      },
    });
  } else {
    results.push({
      check: 'Balance Reconciliation',
      status: 'PASS',
      message:
        'Transaction amounts correctly reconcile with the balance change.',
    });
  }

  return results;
}
