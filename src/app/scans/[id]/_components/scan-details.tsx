'use client';

import { BankStatement } from '@/app/_components/bank-statement';
import { ValidationResults } from '@/app/_components/validation-results';
import type { validateBankStatementTask } from '@/trigger/validate-bank-statement';
import { useRealtimeRun } from '@trigger.dev/react-hooks';

export function ScanDetails({ id }: { id: string }) {
  const { run, error } = useRealtimeRun<typeof validateBankStatementTask>(id);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
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
