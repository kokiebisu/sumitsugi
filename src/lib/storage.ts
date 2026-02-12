import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const S3_ENDPOINT = process.env.S3_ENDPOINT ?? '';
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';
const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'sumitsugi';

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

function extractKey(url: string): string {
  // Handle full URLs (https://cdn.example.com/uploads/test.png)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // Remove leading slash
  }
  // Handle proxy URLs (/api/images/uploads/test.png)
  if (url.startsWith('/api/images/')) {
    return url.replace('/api/images/', '');
  }
  // Handle LocalStack URLs (/storage/uploads/test.png)
  if (url.startsWith('/storage/')) {
    return url.replace('/storage/', '');
  }
  // Handle direct keys (uploads/test.png)
  return url;
}

export async function deleteImage(url: string): Promise<void> {
  const key = extractKey(url);
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function deleteImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  const keys = urls.map(extractKey);
  const client = getS3Client();

  await client.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    })
  );
}
