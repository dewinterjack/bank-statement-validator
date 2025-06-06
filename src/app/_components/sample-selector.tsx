import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { api } from '@/trpc/react';

interface SampleSelectorProps {
  selectedSample: string | null;
  onSampleSelect: (sampleKey: string) => void;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  selectedSample,
  onSampleSelect,
}) => {
  const {
    data: samples,
    isLoading,
    error,
  } = api.storage.fetchSamples.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex justify-center py-4">
        Error fetching samples: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-sm">or try a sample</span>
        <Separator className="flex-1" />
      </div>

      {samples && samples.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {samples
            .filter((item) => item.Key?.endsWith('.pdf'))
            .map((sample) => (
              <Button
                key={sample.Key}
                variant={selectedSample === sample.Key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSampleSelect(sample.Key!)}
                className="text-xs"
              >
                <FileText className="mr-1 h-3 w-3" />
                {sample.Key?.replace('.pdf', '').replace(/[-_]/g, ' ')}
              </Button>
            ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          No sample files available
        </p>
      )}
    </div>
  );
};
