import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, Calendar, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export function AnalysisPreviews() {
  const { data: analyses, isLoading } = api.analysis.getPreviews.useQuery();

  if (isLoading || !analyses || analyses.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-medium">
            Recent Analyses
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Previously analyzed bank statements
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <FileText className="text-primary mt-0.5 h-5 w-5" />
                  <span className="text-muted-foreground text-xs">
                    {formatDate(analysis.createdAt.toISOString())}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {analysis.bankStatement?.accountHolderName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">
                        {analysis.bankStatement.accountHolderName}
                      </span>
                    </div>
                  )}

                  {analysis.bankStatement?.accountNumber && (
                    <div className="text-muted-foreground text-sm">
                      Account: {analysis.bankStatement.accountNumber}
                    </div>
                  )}

                  {analysis.bankStatement?.startDate &&
                    analysis.bankStatement?.endDate && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(
                            analysis.bankStatement.startDate.toISOString(),
                          )}{' '}
                          -{' '}
                          {formatDate(
                            analysis.bankStatement.endDate.toISOString(),
                          )}
                        </span>
                      </div>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-primary text-sm font-medium">
                    View Analysis
                  </span>
                  <ChevronRight className="text-muted-foreground h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
