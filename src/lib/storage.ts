import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3-client';

export const fetchSamples = async () => {
  const command = new ListObjectsV2Command({
    Bucket: 'samples',
  });
  const response = await s3Client.send(command);
  return response.Contents;
};

export const getSampleFile = async (sampleKey: string) => {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: 'samples',
      Key: sampleKey,
    }),
  );

  if (!Body) {
    throw new Error('Sample file body is empty.');
  }

  const bytes = await Body.transformToByteArray();
  const base64Data = Buffer.from(bytes).toString('base64');
  return { data: base64Data, mimeType: 'application/pdf' };
};