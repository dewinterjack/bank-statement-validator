'use client';

import { BankStatement } from '@/app/_components/bank-statement';
import { ValidationResults } from '@/app/_components/validation-results';
import type { validateBankStatementTask } from '@/trigger/validate-bank-statement';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ScanDetails({ id }: { id: string }) {
  const { run, error } = useRealtimeRun<typeof validateBankStatementTask>(id);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (run?.status === 'EXECUTING') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-500"></div>
          <span>Processing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center pt-4">
        <Button asChild>
          <Link href="/">Analyse another document</Link>
        </Button>
      </div>
      <ValidationResults validations={run?.output?.validations ?? []} />

      {run?.output?.bankStatement && (
        <BankStatement
          statement={run?.output?.bankStatement}
          formatDate={(date) => new Date(date).toLocaleDateString()}
        />
      )}
    </div>
  );
}
