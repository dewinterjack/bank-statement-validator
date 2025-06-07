'use client';

import { useInngestSubscription } from '@inngest/realtime/hooks';
import { fetchSubscriptionToken } from '@/actions';
import { BankStatement } from './bank-statement';

export function RealtimeDemo({
  runId,
  reset,
}: {
  runId: string;
  reset: () => void;
}) {
  const { data, error, freshData, state, latestData } = useInngestSubscription({
    refreshToken: () => fetchSubscriptionToken(runId),
  });

  const handleReset = () => {
    reset();
  };

  return (
    <div>
      <h1>Realtime Demo</h1>
      <p>State: {state}</p>
      <p>Error: {error?.message}</p>
      <p>Fresh Data: {freshData ? 'true' : 'false'}</p>
      <p>Latest Data: {latestData?.data.response.accountHolder.name}</p>
      {data.map((message, i) => (
        <div key={i}>
          <BankStatement
            displayedBankStatement={message.data.response}
            handleReset={reset}
            formatDate={(date) => date}
          />
        </div>
      ))}
    </div>
  );
}
