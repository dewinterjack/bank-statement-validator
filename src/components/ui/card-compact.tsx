import * as React from 'react';
import { cn } from '@/lib/utils';

function CardCompact({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-3 rounded-xl border py-3 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

function CardHeaderCompact({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-3',
        className,
      )}
      {...props}
    />
  );
}

function CardContentCompact({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4', className)}
      {...props}
    />
  );
}

export {
  CardCompact as Card,
  CardHeaderCompact as CardHeader,
  CardContentCompact as CardContent,
};
