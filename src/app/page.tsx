'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { bankStatementSchema, type BankStatement } from '@/lib/schemas';
import { StatementHistory } from './_components/statement-history';
import { BankStatementDisplay } from './_components/bank-statement';
import { api } from '@/trpc/react';

export default function BankStatementAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
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
    api: '/api/extract',
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
    setSelectedStatementId(null);
    if (newFile) {
      setDisplayedBankStatement(null);
      setSubmissionError(null);
    }
  };

  const handleSelectStatement = (id: string) => {
    setFile(null);
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
    }
  };

  const handleReset = () => {
    commonSetFile(null);
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
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        {submissionError && (
          <Card className="border-destructive bg-destructive/10 mx-auto mb-4 max-w-2xl border">
            <CardHeader>
              <CardTitle className="text-destructive">Analysis Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{submissionError}</p>
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
                      ? 'border-accent bg-accent/10'
                      : 'border-input hover:border-primary'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <div className="space-y-2">
                    <p className="text-foreground text-lg font-medium">
                      Drop your PDF file here, or{' '}
                      <label className="text-primary hover:text-primary/80 cursor-pointer underline">
                        browse
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      PDF files only, up to 10MB
                    </p>
                  </div>
                </div>

                {file ? (
                  <div className="bg-muted flex items-center justify-between rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-destructive h-8 w-8" />
                      <div>
                        <>
                          <p className="text-foreground font-medium">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          commonSetFile(null);
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
                <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
                {isLoading ? 'Processing Bank Statement' : 'Loading Statement'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 py-10 text-center">
              <p className="text-muted-foreground">
                {isLoading
                  ? 'Extracting information from your document...'
                  : 'Loading...'}
              </p>
            </CardContent>
          </Card>
        )}

        {displayedBankStatement && !currentLoading && (
          <BankStatementDisplay
            displayedBankStatement={displayedBankStatement}
            handleReset={handleReset}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}
