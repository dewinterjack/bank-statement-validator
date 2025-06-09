import type React from 'react';
import {
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TransactionDisplay } from './transaction';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { BankStatement, Transaction } from '@prisma/client';

interface BankStatementProps {
  statement: BankStatement & {
    transactions: Transaction[];
  };
}

export function BankStatementDisplay({ statement }: BankStatementProps) {
  if (!statement) {
    return null;
  }

  const netChange = statement.endingBalance - statement.startingBalance;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Account Holder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div>
              <p className="text-sm font-semibold">
                {statement.accountHolderName}
              </p>
              <div className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                {statement.accountHolderAddress.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDate(statement.startDate.toISOString())} -{' '}
                  {formatDate(statement.endDate.toISOString())}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <FileText className="h-3 w-3" />
                <span>Account: {statement.accountNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Balance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Starting Balance
                </span>
                <span className="text-sm font-semibold">
                  {formatCurrency(
                    statement.startingBalance,
                    statement.currency,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Ending Balance
                </span>
                <span className="text-sm font-semibold">
                  {formatCurrency(statement.endingBalance, statement.currency)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Net Change
                </span>
                <div className="flex items-center gap-1">
                  {netChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={cn('text-sm font-semibold text-red-600', {
                      'text-green-600': netChange > 0,
                    })}
                  >
                    {formatCurrency(netChange, statement.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Total Transactions
                </span>
                <span className="text-sm font-semibold">
                  {statement.transactions?.length ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Credits</span>
                <span className="text-sm font-semibold text-green-600">
                  {
                    statement.transactions.filter((t) => t.type === 'credit')
                      .length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Debits</span>
                <span className="text-sm font-semibold text-red-600">
                  {
                    statement.transactions.filter((t) => t.type === 'debit')
                      .length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <CardDescription className="text-xs">
            Complete list of all transactions from your bank statement
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {statement.transactions.map((transaction, index) => (
              <TransactionDisplay
                key={index}
                transaction={{
                  ...transaction,
                  date: new Date(transaction.date),
                }}
                currency={statement.currency}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
