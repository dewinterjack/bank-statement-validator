import { Inngest } from 'inngest';
import { realtimeMiddleware } from '@inngest/realtime';

export const inngest = new Inngest({
  id: 'bank-statement-validator',
  middleware: [realtimeMiddleware()],
});

export const getInngestApp = () => inngest;
