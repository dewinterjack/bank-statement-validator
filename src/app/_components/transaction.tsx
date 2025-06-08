import type React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/schemas';
import { cn, formatCurrency } from '@/lib/utils';

interface TransactionProps {
  transaction: Transaction;
  formatDate: (date: string) => string;
  currency: string | undefined;
}

export function Transaction({
  transaction,
  formatDate,
  currency,
}: TransactionProps) {
  const isCredit = transaction.type === 'credit';
  return (
    <div className="border-border hover:bg-muted flex items-center justify-between rounded-lg border p-4 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Badge
            variant={isCredit ? 'default' : 'destructive'}
            className={cn('bg-red-600 hover:bg-red-700', {
              'bg-green-600 hover:bg-green-700': isCredit,
            })}
          >
            {isCredit ? 'Credit' : 'Debit'}
          </Badge>
          <span className="font-medium">{transaction.description}</span>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {formatDate(transaction.date)}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn('font-semibold text-red-600', {
            'text-green-600': isCredit,
          })}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </p>
        <p className="text-muted-foreground text-sm">
          Balance: {formatCurrency(transaction.balance, currency)}
        </p>
      </div>
    </div>
  );
}
