import type React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import type { AIValidation, CalculatedValidation } from '@prisma/client';

interface ValidationResultsProps {
  aiValidations: AIValidation[];
  calculatedValidations: CalculatedValidation[];
}

const statusIcons = {
  PASS: CheckCircle,
  FAIL: XCircle,
  UNKNOWN: HelpCircle,
};

const statusColors = {
  PASS: 'text-green-600',
  FAIL: 'text-red-600',
  UNKNOWN: 'text-muted-foreground',
};

export function ValidationResults({
  aiValidations,
  calculatedValidations,
}: ValidationResultsProps) {
  if (aiValidations.length === 0 && calculatedValidations.length === 0) {
    return (
      <div className="text-destructive text-center text-sm">
        No validations found
      </div>
    );
  }

  const allValidations = [
    ...aiValidations.map((v) => ({ ...v, type: 'AI' as const })),
    ...calculatedValidations.map((v) => ({
      ...v,
      type: 'CALCULATED' as const,
    })),
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          Validation Summary
        </CardTitle>
        <CardDescription className="text-sm">
          Automated checks performed on the uploaded document.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {allValidations.map((validation, index) => {
            const status = validation.passed ? 'PASS' : 'FAIL';
            const Icon = statusIcons[status] ?? HelpCircle;
            const color = statusColors[status] ?? 'text-muted-foreground';

            return (
              <div key={index} className="flex items-start gap-3 py-2">
                <Icon className={`${color} mt-0.5 h-4 w-4 flex-shrink-0`} />
                <div className="min-w-0 flex-grow">
                  <p className="text-sm leading-tight font-medium">
                    {validation.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-tight">
                    {validation.description ?? validation.reasoning}
                  </p>
                  {validation.type === 'AI' && 'confidence' in validation && (
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
