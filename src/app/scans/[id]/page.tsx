import { TriggerProvider } from './_components/trigger-provider';
import { cookies } from 'next/headers';
import { ScanDetails } from './_components/scan-details';

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const publicAccessToken = cookieStore.get('publicAccessToken');
  const freshUpload = cookieStore.get('freshUpload');

  if (!publicAccessToken) {
    return <div>No public access token found</div>;
  }

  return (
    <TriggerProvider accessToken={publicAccessToken.value}>
      <ScanDetails id={id} />
    </TriggerProvider>
  );
}
