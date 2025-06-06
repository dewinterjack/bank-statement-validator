import { extractBankStatement } from '@/lib/stream-bank-statement';
import { getSampleFile } from '@/lib/storage';

export const maxDuration = 60;

export async function POST(req: Request) {
  interface RequestBody {
    sampleKey: string;
  }
  const { sampleKey } = (await req.json()) as RequestBody;

  let fileToProcess: { data: string; mimeType: string };

  try {
    fileToProcess = await getSampleFile(sampleKey);
  } catch (error) {
    console.error('Error fetching sample from storage:', error);
    return new Response(JSON.stringify({ error: 'Failed to load sample.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await extractBankStatement(
    fileToProcess.data,
    fileToProcess.mimeType,
  );

  return result.toTextStreamResponse();
} 