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
          <h3 className="text-lg font-medium text-gray-900">Recent Analysis</h3>
          <p className="mt-1 text-sm text-gray-500">
            Previously analyzed statements
          </p>
        </div>
        <button className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statements.slice(0, 3).map((statement) => (
          <div
            key={statement.id}
            className="group cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
            onClick={() => onSelectStatement(statement.id)}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(statement.documentDate)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate text-xs text-gray-600">
                      {statement.accountHolderName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      •••• {statement.accountNumber.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
