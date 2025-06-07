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
  PASS: 'text-primary',
  WARN: 'text-yellow-500',
  FAIL: 'text-destructive',
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Validation Summary
          <Badge variant={statusBadges[overallStatus]}>{overallStatus}</Badge>
        </CardTitle>
        <CardDescription>
          Automated checks performed on the uploaded document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {validations.map((validation, index) => {
            const Icon = statusIcons[validation.status] ?? HelpCircle;
            const color =
              statusColors[validation.status] ?? 'text-muted-foreground';
            return (
              <li key={index} className="flex items-start gap-3">
                <Icon className={`${color} mt-1 h-5 w-5 flex-shrink-0`} />
                <div className="flex-grow">
                  <p className="font-medium">{validation.check}</p>
                  <p className="text-muted-foreground text-sm">
                    {validation.message}
                  </p>
                  {validation.confidence !== undefined && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Confidence:
                      </span>
                      <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full ${
                            validation.confidence > 0.7
                              ? 'bg-primary'
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
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
