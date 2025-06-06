import { extractBankStatement } from '@/lib/stream-bank-statement';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-client';
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
    return new Response(JSON.stringify({ error: 'Failed to upload file to S3.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await extractBankStatement(file.data, file.mimeType, { s3Key });

  return result.toTextStreamResponse();
}
