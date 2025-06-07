import type { BankStatement } from './schemas';

export function validateBankStatement(statement: BankStatement): string[] {
  const errors: string[] = [];

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
    errors.push(
      `Transaction sum (${totalTransactions.toFixed(2)}) does not reconcile with balance difference (${balanceDifference.toFixed(2)}).`,
    );
  }

  return errors;
}
