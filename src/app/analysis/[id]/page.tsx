import { AnalysisDetails } from './_components/analysis-details';

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = await params;
  return <AnalysisDetails id={id} />;
}
