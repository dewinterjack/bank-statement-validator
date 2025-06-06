import { extractBankStatement } from '@/lib/stream-bank-statement';

export const maxDuration = 60;

export async function POST(req: Request) {
  interface RequestBody {
    file: { data: string; mimeType: string };
  }
  const { file } = (await req.json()) as RequestBody;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await extractBankStatement(file.data, file.mimeType);

  return result.toTextStreamResponse();
}
