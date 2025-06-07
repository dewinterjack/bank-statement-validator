import type React from 'react';
import { Badge } from '@/components/ui/badge';
import type { PartialTransaction } from '@/lib/schemas';
import { formatCurrency } from '@/lib/utils';

interface TransactionProps {
  transaction: PartialTransaction;
  formatDate: (date: string) => string;
  currency: string | undefined;
}

export function Transaction({
  transaction,
  formatDate,
  currency,
}: TransactionProps) {
  return (
    <div className="border-border hover:bg-muted flex items-center justify-between rounded-lg border p-4 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {transaction.type && (
            <Badge
              variant={
                transaction.type === 'credit' ? 'default' : 'destructive'
              }
              className={
                transaction.type === 'credit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {transaction.type === 'credit' ? 'Credit' : 'Debit'}
            </Badge>
          )}
          <span className="font-medium">{transaction.description}</span>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {transaction.date && formatDate(transaction.date)}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaction.type === 'credit' ? '+' : '-'}
          {transaction.amount != undefined &&
            currency != undefined &&
            formatCurrency(transaction.amount, currency)}
        </p>
        <p className="text-muted-foreground text-sm">
          Balance:{' '}
          {transaction.balance != undefined &&
            currency != undefined &&
            formatCurrency(transaction.balance, currency)}
        </p>
      </div>
    </div>
  );
}
