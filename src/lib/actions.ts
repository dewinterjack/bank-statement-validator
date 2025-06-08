'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-client';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from '@trigger.dev/sdk/v3';
import type { validateBankStatementTask } from '@/trigger/validate-bank-statement';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface FileData {
  data: string;
  mimeType: string;
}

export async function extractBankStatement(fileData: FileData) {
  if (!fileData) {
    throw new Error('No file provided.');
  }

  const analysisId = uuidv4();
  const s3Key = `bank-statements/${analysisId}.pdf`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: 'pdfs',
        Key: s3Key,
        Body: Buffer.from(fileData.data, 'base64'),
        ContentType: fileData.mimeType,
      }),
    );
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3.');
  }

  const handle = await tasks.trigger<typeof validateBankStatementTask>(
    'validate-bank-statement',
    { s3Key, analysisId },
  );

  const cookieStore = await cookies();
  cookieStore.set('publicAccessToken', handle.publicAccessToken);
  cookieStore.set('freshUpload', 'true', { maxAge: 10 });

  redirect(`/scans/${handle.id}`);
}
