'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Upload,
  FileText,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
}

interface BankStatement {
  accountHolder: {
    name: string;
    address: string[];
  };
  documentDate: string;
  accountNumber: string;
  startingBalance: number;
  endingBalance: number;
  transactions: Transaction[];
}

export default function BankStatementAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BankStatement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const mockData: BankStatement = {
    accountHolder: {
      name: 'John Michael Smith',
      address: ['1234 Oak Street', 'Springfield, IL 62701', 'United States'],
    },
    documentDate: 'December 31, 2024',
    accountNumber: '****-****-****-5678',
    startingBalance: 2450.75,
    endingBalance: 3127.42,
    transactions: [
      {
        id: '1',
        date: '2024-12-01',
        description: 'Direct Deposit - Salary',
        amount: 3200.0,
        type: 'credit',
        balance: 5650.75,
      },
      {
        id: '2',
        date: '2024-12-02',
        description: 'Grocery Store Purchase',
        amount: -127.45,
        type: 'debit',
        balance: 5523.3,
      },
      {
        id: '3',
        date: '2024-12-03',
        description: 'Electric Bill Payment',
        amount: -89.32,
        type: 'debit',
        balance: 5433.98,
      },
      {
        id: '4',
        date: '2024-12-05',
        description: 'ATM Withdrawal',
        amount: -100.0,
        type: 'debit',
        balance: 5333.98,
      },
      {
        id: '5',
        date: '2024-12-07',
        description: 'Online Transfer',
        amount: -500.0,
        type: 'debit',
        balance: 4833.98,
      },
      {
        id: '6',
        date: '2024-12-10',
        description: 'Refund - Amazon',
        amount: 45.67,
        type: 'credit',
        balance: 4879.65,
      },
      {
        id: '7',
        date: '2024-12-12',
        description: 'Restaurant Payment',
        amount: -78.9,
        type: 'debit',
        balance: 4800.75,
      },
      {
        id: '8',
        date: '2024-12-15',
        description: 'Freelance Payment',
        amount: 850.0,
        type: 'credit',
        balance: 5650.75,
      },
      {
        id: '9',
        date: '2024-12-18',
        description: 'Rent Payment',
        amount: -1200.0,
        type: 'debit',
        balance: 4450.75,
      },
      {
        id: '10',
        date: '2024-12-20',
        description: 'Gas Station',
        amount: -65.43,
        type: 'debit',
        balance: 4385.32,
      },
      {
        id: '11',
        date: '2024-12-22',
        description: 'Investment Dividend',
        amount: 125.5,
        type: 'credit',
        balance: 4510.82,
      },
      {
        id: '12',
        date: '2024-12-28',
        description: 'Holiday Bonus',
        amount: 500.0,
        type: 'credit',
        balance: 5010.82,
      },
      {
        id: '13',
        date: '2024-12-30',
        description: 'Year-end Transfer',
        amount: -1883.4,
        type: 'debit',
        balance: 3127.42,
      },
    ],
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const simulateProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    // Simulate processing steps
    const steps = [
      { message: 'Reading PDF file...', duration: 800 },
      { message: 'Extracting text content...', duration: 1200 },
      { message: 'Parsing account information...', duration: 900 },
      { message: 'Analyzing transactions...', duration: 1100 },
      { message: 'Calculating balances...', duration: 600 },
      { message: 'Finalizing results...', duration: 400 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) =>
        setTimeout(resolve, steps[i]?.duration ?? 0),
      );
      setProgress(((i + 1) / steps.length) * 100);
    }

    setResults(mockData);
    setIsProcessing(false);
  };

  const handleAnalyze = async () => {
    if (file) {
      await simulateProcessing();
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setProgress(0);
    setIsProcessing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        {!results && !isProcessing && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Bank Statement
              </CardTitle>
              <CardDescription>
                Select or drag and drop a PDF bank statement to begin analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Drop your PDF file here, or{' '}
                    <label className="cursor-pointer text-blue-600 underline hover:text-blue-700">
                      browse
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF files only, up to 10MB
                  </p>
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                    <Button onClick={handleAnalyze}>Analyze Statement</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                Processing Bank Statement
              </CardTitle>
              <CardDescription>
                Analyzing your PDF and extracting financial data...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  'Reading PDF content',
                  'Extracting account info',
                  'Parsing transactions',
                  'Calculating balances',
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 p-3"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        progress > (index + 1) * 25
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Analysis Results
              </h2>
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
                      {results.accountHolder.name}
                    </p>
                    <div className="mt-1 text-sm text-gray-600">
                      {results.accountHolder.address.map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Statement Date: {results.documentDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Account: {results.accountNumber}</span>
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
                      <span className="text-sm text-gray-600">
                        Starting Balance
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(results.startingBalance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Ending Balance
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(results.endingBalance)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Net Change</span>
                      <div className="flex items-center gap-1">
                        {results.endingBalance > results.startingBalance ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`font-semibold ${
                            results.endingBalance > results.startingBalance
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(
                            results.endingBalance - results.startingBalance,
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
                      <span className="text-sm text-gray-600">
                        Total Transactions
                      </span>
                      <span className="font-semibold">
                        {results.transactions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Credits</span>
                      <span className="font-semibold text-green-600">
                        {
                          results.transactions.filter(
                            (t) => t.type === 'credit',
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Debits</span>
                      <span className="font-semibold text-red-600">
                        {
                          results.transactions.filter((t) => t.type === 'debit')
                            .length
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
                  {results.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              transaction.type === 'credit'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                          </Badge>
                          <span className="font-medium">
                            {transaction.description}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === 'credit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Balance: {formatCurrency(transaction.balance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
