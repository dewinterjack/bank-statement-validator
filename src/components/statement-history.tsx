'use client';

import { api } from '@/trpc/react';
import { User, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface StatementHistoryProps {
  onSelectStatement: (id: string) => void;
}

export function StatementHistory({ onSelectStatement }: StatementHistoryProps) {
  const {
    data: statements,
    isLoading,
    error,
  } = api.statement.getAllPreviews.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading || error || !statements || statements.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-medium">
            Recent Analysis
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Previously analyzed statements
          </p>
        </div>
        <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors">
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statements.slice(0, 3).map((statement) => (
          <div
            key={statement.id}
            className="group border-border hover:border-border/80 cursor-pointer rounded-lg border p-4 transition-all hover:shadow-sm"
            onClick={() => onSelectStatement(statement.id)}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="text-foreground text-sm font-medium">
                    {formatDate(statement.startDate)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-muted-foreground truncate text-xs">
                      {statement.accountHolderName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-muted-foreground text-xs">
                      •••• {statement.accountNumber.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
