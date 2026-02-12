import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const S3_ENDPOINT = process.env.S3_ENDPOINT ?? '';
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';
const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'tsumugi';

const isLocalStack = Boolean(S3_ENDPOINT);

function getS3Client(): S3Client {
  if (isLocalStack) {
    return new S3Client({
      region: 'us-east-1',
      endpoint: S3_ENDPOINT,
      forcePathStyle: true,
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    });
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadImage(
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const ext = contentType.split('/')[1] ?? 'jpg';
  const key = `uploads/${randomUUID()}.${ext}`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

function getPublicUrl(key: string): string {
  if (isLocalStack) {
    return `/storage/${key}`;
  }
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // Proxy through Next.js API — the S3 API endpoint requires authentication
  return `/api/images/${key}`;
}

export async function getImage(
  key: string
): Promise<{ body: ReadableStream; contentType: string } | null> {
  const client = getS3Client();
  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
    );
    if (!response.Body) return null;
    return {
      body: response.Body.transformToWebStream() as ReadableStream,
      contentType: response.ContentType ?? 'application/octet-stream',
    };
  } catch {
    return null;
  }
}

export async function uploadPdf(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const key = `pdfs/${randomUUID()}-${filename}.pdf`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    })
  );

  return getPublicUrl(key);
}

export function isStorageConfigured(): boolean {
  if (isLocalStack) return true;
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}
