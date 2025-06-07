import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

export const statementRouter = createTRPCRouter({
  getAllPreviews: publicProcedure.query(async ({ ctx }) => {
    const statements = await ctx.db.bankStatement.findMany({
      orderBy: { documentDate: 'desc' },
      select: {
        id: true,
        documentDate: true,
        accountNumber: true,
        accountHolderName: true,
      },
    });

    return statements;
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const statement = await ctx.db.bankStatement.findUnique({
        where: { id: input.id },
        include: {
            
          transactions: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      });

      if (!statement) {
        return null;
      }

      return {
        id: statement.id,
        documentDate: statement.documentDate.toISOString(),
        accountNumber: statement.accountNumber,
        startingBalance: statement.startingBalance,
        endingBalance: statement.endingBalance,
        currency: statement.currency,
        accountHolder: {
          name: statement.accountHolderName,
          address: statement.accountHolderAddress,
        },
        transactions: statement.transactions.map((tx) => ({
          id: tx.id,
          date: tx.date.toISOString(),
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          balance: tx.balance,
        })),
      };
    }),
});
