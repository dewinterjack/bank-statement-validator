'use client';

import { BankStatementDisplay } from '@/components/bank-statement';
import { ValidationResults } from '@/components/validation-results';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useBankValidation } from '@/hooks/use-bank-validation';

export function ScanDetails({ id }: { id: string }) {
  const { status, analysisQuery } = useBankValidation(id);

  if (status.state === 'completed' && analysisQuery.data) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="space-y-4">
          <ValidationResults
            aiValidations={analysisQuery.data.validations ?? []}
            calculatedValidations={
              analysisQuery.data.calculatedValidations ?? []
            }
          />

          {analysisQuery.data.bankStatement && (
            <BankStatementDisplay
              statement={analysisQuery.data.bankStatement}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="mb-4 text-center text-2xl font-bold">
            Run in Progress
          </h2>
          <Spinner className="mb-4" show={true} />
          <Progress value={status.progress} className="w-full" />
          <p className="text-muted-foreground mt-4 text-center">
            {status.label}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
