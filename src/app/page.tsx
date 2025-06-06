'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
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
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { bankStatementSchema, type BankStatement } from '@/lib/schemas';
import { SampleSelector } from './_components/sample-selector';
import { StatementHistory } from './_components/statement-history';
import { api } from '@/trpc/react';

export default function BankStatementAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(
    null,
  );

  const [displayedBankStatement, setDisplayedBankStatement] =
    useState<BankStatement | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    object: streamedObject,
    submit,
    isLoading,
    error: streamError,
  } = useObject({
    api: selectedSample ? '/api/extract-sample' : '/api/extract',
    schema: bankStatementSchema,
  });

  const {
    data: selectedStatement,
    isLoading: isLoadingStatement,
    error: statementError,
  } = api.statement.getById.useQuery(
    { id: selectedStatementId! },
    {
      enabled: !!selectedStatementId,
    },
  );

  useEffect(() => {
    if (streamedObject) {
      setDisplayedBankStatement(streamedObject as BankStatement);
      setSubmissionError(null);
    }
  }, [streamedObject]);

  useEffect(() => {
    if (selectedStatement) {
      setDisplayedBankStatement(selectedStatement as BankStatement);
      setSelectedStatementId(null);
    }
  }, [selectedStatement]);

  useEffect(() => {
    const err = streamError ?? statementError;
    if (err) {
      setSubmissionError(
        err.message ?? 'An error occurred while processing the statement.',
      );
      setDisplayedBankStatement(null);
    }
  }, [streamError, statementError]);

  const commonSetFile = (newFile: File | null) => {
    setFile(newFile);
    setSelectedSample(null);
    setSelectedStatementId(null);
    if (newFile) {
      setDisplayedBankStatement(null);
      setSubmissionError(null);
    }
  };

  const handleSampleSelect = (sampleKey: string) => {
    setSelectedSample(sampleKey);
    setFile(null);
    setSelectedStatementId(null);
    setDisplayedBankStatement(null);
    setSubmissionError(null);
  };

  const handleSelectStatement = (id: string) => {
    setFile(null);
    setSelectedSample(null);
    setDisplayedBankStatement(null);
    setSubmissionError(null);
    setSelectedStatementId(id);
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
        commonSetFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      commonSetFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (file) {
      setDisplayedBankStatement(null);
      setSubmissionError(null);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            submit({ file: { data: base64Data, mimeType: file.type } });
          } catch (err) {
            console.error('Error submitting to API:', err);
            setSubmissionError(
              err instanceof Error
                ? err.message
                : 'Failed to submit for analysis.',
            );
          }
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          setSubmissionError('Error reading file.');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error preparing file for submission:', err);
        setSubmissionError(
          err instanceof Error
            ? err.message
            : 'Error preparing file for submission.',
        );
      }
    } else if (selectedSample) {
      setDisplayedBankStatement(null);
      setSubmissionError(null);
      try {
        submit({ sampleKey: selectedSample });
      } catch (err) {
        console.error('Error submitting sample to API:', err);
        setSubmissionError(
          err instanceof Error
            ? err.message
            : 'Failed to submit sample for analysis.',
        );
      }
    }
  };

  const handleReset = () => {
    commonSetFile(null);
    setSelectedSample(null);
    setDisplayedBankStatement(null);
    setSubmissionError(null);
    setSelectedStatementId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentLoading = isLoading || isLoadingStatement;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        {submissionError && (
          <Card className="mx-auto mb-4 max-w-2xl border border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Analysis Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{submissionError}</p>
              <Button
                variant="outline"
                onClick={() => setSubmissionError(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {!displayedBankStatement && !currentLoading && (
          <div className="space-y-8">
            <Card className="mx-auto max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bank Statement Analyzer
                </CardTitle>
                <CardDescription>
                  Upload a PDF bank statement to extract and analyze financial
                  data
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

                <SampleSelector
                  selectedSample={selectedSample}
                  onSampleSelect={handleSampleSelect}
                />

                {file || selectedSample ? (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-600" />
                      <div>
                        {file ? (
                          <>
                            <p className="font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-gray-900">
                              {selectedSample
                                ?.replace('.pdf', '')
                                .replace(/[-_]/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-500">Sample PDF</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          commonSetFile(null);
                          setSelectedSample(null);
                        }}
                      >
                        Remove
                      </Button>
                      <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze Statement'}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <StatementHistory onSelectStatement={handleSelectStatement} />
          </div>
        )}

        {currentLoading && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                {isLoading ? 'Processing Bank Statement' : 'Loading Statement'}
              </CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Analyzing your PDF and extracting financial data. Please wait...'
                  : 'Fetching your statement from the database. Please wait...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-10 text-center">
              <p className="text-gray-600">
                {isLoading
                  ? 'Extracting information from your document...'
                  : 'Loading...'}
              </p>
            </CardContent>
          </Card>
        )}

        {displayedBankStatement && !currentLoading && (
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
                      {displayedBankStatement.accountHolder.name}
                    </p>
                    <div className="mt-1 text-sm text-gray-600">
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
                      <span>
                        Account: {displayedBankStatement.accountNumber}
                      </span>
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
                        {formatCurrency(displayedBankStatement.startingBalance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Ending Balance
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(displayedBankStatement.endingBalance)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Net Change</span>
                      <div className="flex items-center gap-1">
                        {displayedBankStatement.endingBalance >
                        displayedBankStatement.startingBalance ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`font-semibold ${
                            displayedBankStatement.endingBalance >
                            displayedBankStatement.startingBalance
                              ? 'text-green-600'
                              : 'text-red-600'
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
                      <span className="text-sm text-gray-600">
                        Total Transactions
                      </span>
                      <span className="font-semibold">
                        {displayedBankStatement.transactions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Credits</span>
                      <span className="font-semibold text-green-600">
                        {
                          displayedBankStatement.transactions.filter(
                            (t) => t.type === 'credit',
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Debits</span>
                      <span className="font-semibold text-red-600">
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
                    <div
                      key={`${transaction.date}-${transaction.description}-${transaction.amount}`}
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
