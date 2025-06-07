'use client';

import type React from 'react';
import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { extractBankStatement } from '@/lib/actions';

export default function BankStatementAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const commonSetFile = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setSubmissionError(null);
    }
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
      setSubmissionError(null);
      setIsLoading(true);

      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (!base64Data) {
              throw new Error('Failed to extract file data');
            }
            await extractBankStatement({
              data: base64Data,
              mimeType: file.type,
            });
          } catch (err) {
            console.error('Error submitting to server action:', err);
            setSubmissionError(
              err instanceof Error
                ? err.message
                : 'Failed to submit for analysis.',
            );
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          setSubmissionError('Error reading file.');
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error preparing file for submission:', err);
        setSubmissionError(
          err instanceof Error
            ? err.message
            : 'Error preparing file for submission.',
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        {submissionError && (
          <Card className="border-destructive bg-destructive/10 mx-auto mb-4 max-w-2xl border">
            <CardHeader>
              <CardTitle className="text-destructive">Upload Error</CardTitle>
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

        {!isLoading && (
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
          </div>
        )}
      </div>
    </div>
  );
}
