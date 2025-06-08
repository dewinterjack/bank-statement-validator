import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

export const analysisRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const analysis = await ctx.db.statementAnalysis.findUnique({
        where: { id: input.id },
        include: {
          validations: true,
          calculatedValidations: true,
          bankStatement: {
            include: {
              transactions: {
                orderBy: {
                  date: 'asc',
                },
              },
            },
          },
        },
      });

      return analysis;
    }),
});
