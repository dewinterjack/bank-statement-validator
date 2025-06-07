import { inngest } from '@/lib/inngest/client';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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

  const s3Key = `bank-statements/${uuidv4()}.pdf`;

  await inngest.send({
    name: 'scan/pdf.uploaded',
    data: {
      file: {
        data: file.data,
        mimeType: file.mimeType,
      },
      s3Key,
    },
  });

  return NextResponse.json({ message: 'Event sent!' });
}
