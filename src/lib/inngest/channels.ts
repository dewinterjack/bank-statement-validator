import { topic, channel } from '@inngest/realtime';
import z from 'zod';
import { bankStatementSchema } from '@/lib/schemas';

const scanRunChannel = channel((runId: string) => `scan-pdf.${runId}`).addTopic(
  topic('scan').schema(
    z.object({
      response: bankStatementSchema,
      success: z.boolean(),
    }),
  ),
);

const logsChannel = channel('logs').addTopic(topic('info').type<string>());

export { scanRunChannel, logsChannel };
