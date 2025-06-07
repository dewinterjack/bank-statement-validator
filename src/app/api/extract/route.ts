import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-client';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from '@trigger.dev/sdk/v3';
import type { validateBankStatementTask } from '@/trigger/validate-bank-statement';
import { NextResponse } from 'next/server';

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

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: 'pdfs',
        Key: s3Key,
        Body: Buffer.from(file.data, 'base64'),
        ContentType: file.mimeType,
      }),
    );
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload file to S3.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const handle = await tasks.trigger<typeof validateBankStatementTask>(
    'validate-bank-statement',
    { s3Key },
  );

  return NextResponse.json({ handle });
}
