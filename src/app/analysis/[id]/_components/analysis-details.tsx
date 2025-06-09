'use client';

import { BankStatementDisplay } from '@/components/bank-statement';
import { ValidationResults } from '@/components/validation-results';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';
import { api } from '@/trpc/react';

export function AnalysisDetails({ id }: { id: string }) {
  const { data, isLoading, error } = api.analysis.getById.useQuery({ id });

  if (isLoading) {
    return <Spinner show={true} />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="text-destructive mb-4 h-12 w-12" />
              <h2 className="mb-2 text-2xl font-bold">
                Error Loading Analysis
              </h2>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="space-y-4">
          <ValidationResults
            aiValidations={data.validations ?? []}
            calculatedValidations={data.calculatedValidations ?? []}
          />

          {data.bankStatement && (
            <BankStatementDisplay statement={data.bankStatement} />
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
            Loading Analysis
          </h2>
          <Spinner className="mb-4" show={true} />
          <p className="text-muted-foreground mt-4 text-center">
            Fetching analysis data...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
