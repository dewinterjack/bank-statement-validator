'use client';

import { parseStatus } from '@/lib/metadataStore';
import { type validateBankStatementTask } from '@/trigger/validate-bank-statement';
import { api } from '@/trpc/react';
import { skipToken } from '@tanstack/react-query';
import { useRealtimeRun } from '@trigger.dev/react-hooks';

interface BankValidationStatus {
  state: 'running' | 'completed';
  progress: number;
  label: string;
  analysisId?: string;
}

export function useBankValidation(id: string) {
  const { run, error } = useRealtimeRun<typeof validateBankStatementTask>(id);
  const analysisQuery = api.analysis.getById.useQuery(
    run?.output?.result ? { id: run.output.result } : skipToken,
    {
      enabled: !!run?.output?.result,
    },
  );

  const status: BankValidationStatus = {
    state: run?.status === 'COMPLETED' ? 'completed' : 'running',
    progress: 0,
    label: 'Initializing...',
    analysisId: run?.output?.result ?? undefined,
  };

  if (run?.metadata) {
    const { progress, label } = parseStatus(run.metadata);
    status.progress = progress;
    status.label = label;
  }

  return {
    status,
    error,
    run,
    analysisQuery,
  };
}
