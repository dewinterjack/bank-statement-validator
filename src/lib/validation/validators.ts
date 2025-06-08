import type { BankStatement } from '@/lib/schemas';
import type { CalculatedValidation } from './schemas';

export function validateBankStatement(
  statement: BankStatement,
): CalculatedValidation[] {
  const results: CalculatedValidation[] = [];
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
      title: 'Balance Reconciliation',
      passed: false,
      reasoning: `Transaction sum (${totalTransactions.toFixed(2)}) does not match balance change (${balanceDifference.toFixed(2)}).`,
      additionalDetails: {
        calculatedChange: totalTransactions,
        reportedChange: balanceDifference,
      },
    });
  } else {
    results.push({
      title: 'Balance Reconciliation',
      passed: true,
      reasoning:
        'Transaction amounts correctly reconcile with the balance change.',
    });
  }

  return results;
}
