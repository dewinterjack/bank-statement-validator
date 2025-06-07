import type React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/schemas';

interface TransactionProps {
  transaction: Transaction;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export function Transaction({
  transaction,
  formatCurrency,
  formatDate,
}: TransactionProps) {
  return (
    <div
      key={`${transaction.date}-${transaction.description}-${transaction.amount}`}
      className="border-border hover:bg-muted flex items-center justify-between rounded-lg border p-4 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Badge
            variant={transaction.type === 'credit' ? 'default' : 'secondary'}
          >
            {transaction.type === 'credit' ? 'Credit' : 'Debit'}
          </Badge>
          <span className="font-medium">{transaction.description}</span>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {formatDate(transaction.date)}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            transaction.type === 'credit' ? 'text-primary' : 'text-destructive'
          }`}
        >
          {transaction.type === 'credit' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-muted-foreground text-sm">
          Balance: {formatCurrency(transaction.balance)}
        </p>
      </div>
    </div>
  );
}
