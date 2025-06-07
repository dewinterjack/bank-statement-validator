import type React from 'react';
import {
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BankStatement } from '@/lib/schemas';
import { Transaction } from './transaction';

interface BankStatementDisplayProps {
  displayedBankStatement: BankStatement;
  handleReset: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export function BankStatementDisplay({
  displayedBankStatement,
  handleReset,
  formatCurrency,
  formatDate,
}: BankStatementDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-bold">Analysis Results</h2>
        <Button variant="outline" onClick={handleReset}>
          Analyze Another Statement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Holder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">
                {displayedBankStatement.accountHolder.name}
              </p>
              <div className="text-muted-foreground mt-1 text-sm">
                {displayedBankStatement.accountHolder.address.map(
                  (line, index) => (
                    <p key={index}>{line}</p>
                  ),
                )}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  Statement Date:{' '}
                  {formatDate(displayedBankStatement.documentDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>Account: {displayedBankStatement.accountNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Starting Balance
                </span>
                <span className="font-semibold">
                  {formatCurrency(displayedBankStatement.startingBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Ending Balance
                </span>
                <span className="font-semibold">
                  {formatCurrency(displayedBankStatement.endingBalance)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Net Change
                </span>
                <div className="flex items-center gap-1">
                  {displayedBankStatement.endingBalance >
                  displayedBankStatement.startingBalance ? (
                    <TrendingUp className="text-primary h-4 w-4" />
                  ) : (
                    <TrendingDown className="text-destructive h-4 w-4" />
                  )}
                  <span
                    className={`font-semibold ${
                      displayedBankStatement.endingBalance >
                      displayedBankStatement.startingBalance
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(
                      displayedBankStatement.endingBalance -
                        displayedBankStatement.startingBalance,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Transactions
                </span>
                <span className="font-semibold">
                  {displayedBankStatement.transactions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Credits</span>
                <span className="text-primary font-semibold">
                  {
                    displayedBankStatement.transactions.filter(
                      (t) => t.type === 'credit',
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Debits</span>
                <span className="text-destructive font-semibold">
                  {
                    displayedBankStatement.transactions.filter(
                      (t) => t.type === 'debit',
                    ).length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Complete list of all transactions from your bank statement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayedBankStatement.transactions.map((transaction) => (
              <Transaction
                key={`${transaction.date}-${transaction.description}-${transaction.amount}`}
                transaction={transaction}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
