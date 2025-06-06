
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { fetchSamples } from '@/lib/storage';

export const storageRouter = createTRPCRouter({
  fetchSamples: publicProcedure
    .query(async () => {
      return await fetchSamples();
    }),
});
