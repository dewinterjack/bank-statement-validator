import type React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { ValidationResult, ValidationStatus } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';

interface ValidationResultsProps {
  validations: ValidationResult[];
}

const statusIcons: Record<ValidationStatus, React.ElementType> = {
  PASS: CheckCircle2,
  WARN: AlertTriangle,
  FAIL: XCircle,
};

const statusColors: Record<ValidationStatus, string> = {
  PASS: 'text-green-600',
  WARN: 'text-yellow-600',
  FAIL: 'text-red-600',
};

const statusBadges: Record<
  ValidationStatus,
  'default' | 'destructive' | 'secondary'
> = {
  PASS: 'default',
  WARN: 'secondary',
  FAIL: 'destructive',
};

export function ValidationResults({ validations }: ValidationResultsProps) {
  if (validations.length === 0) {
    return null;
  }

  const overallStatus = validations.some((v) => v.status === 'FAIL')
    ? 'FAIL'
    : validations.some((v) => v.status === 'WARN')
      ? 'WARN'
      : 'PASS';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          Validation Summary
          <Badge variant={statusBadges[overallStatus]}>{overallStatus}</Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Automated checks performed on the uploaded document.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {validations.map((validation, index) => {
            const Icon = statusIcons[validation.status] ?? HelpCircle;
            const color =
              statusColors[validation.status] ?? 'text-muted-foreground';
            return (
              <div key={index} className="flex items-start gap-3 py-2">
                <Icon className={`${color} mt-0.5 h-4 w-4 flex-shrink-0`} />
                <div className="min-w-0 flex-grow">
                  <p className="text-sm leading-tight font-medium">
                    {validation.check}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-tight">
                    {validation.message}
                  </p>
                  {validation.confidence !== undefined && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Confidence:
                      </span>
                      <div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-1.5 rounded-full ${
                            validation.confidence > 0.7
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${validation.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">{`${Math.round(
                        validation.confidence * 100,
                      )}%`}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
