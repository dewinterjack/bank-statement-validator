'use server';
import { getSubscriptionToken, type Realtime } from '@inngest/realtime';
import { scanRunChannel } from './lib/inngest/channels';
import { getInngestApp } from './lib/inngest/client';

export async function fetchSubscriptionToken(
  runId: string,
): Promise<Realtime.Token<typeof scanRunChannel, ['scan']>> {
  const token = await getSubscriptionToken(getInngestApp(), {
    // TODO: pass in a uuid from client
    channel: scanRunChannel(runId),
    topics: ['scan'],
  });

  return token;
}
