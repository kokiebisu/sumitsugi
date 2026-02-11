import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn().mockResolvedValue({});

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class MockS3Client {
      config: unknown;
      constructor(config: unknown) {
        this.config = config;
      }
      send = mockSend;
    },
    PutObjectCommand: class MockPutObjectCommand {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
  };
});

vi.mock('crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

describe('storage', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSend.mockClear();
  });

  describe('isStorageConfigured', () => {
    it('returns true when S3_ENDPOINT is set (LocalStack mode)', async () => {
      vi.stubEnv('S3_ENDPOINT', 'http://localhost:4566');
      vi.stubEnv('R2_ACCOUNT_ID', '');
      vi.stubEnv('R2_ACCESS_KEY_ID', '');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', '');

      const { isStorageConfigured } = await import('../storage');
      expect(isStorageConfigured()).toBe(true);
    });

    it('returns true when R2 credentials are configured', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');

      const { isStorageConfigured } = await import('../storage');
      expect(isStorageConfigured()).toBe(true);
    });

    it('returns false when no storage is configured', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_ACCOUNT_ID', '');
      vi.stubEnv('R2_ACCESS_KEY_ID', '');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', '');

      const { isStorageConfigured } = await import('../storage');
      expect(isStorageConfigured()).toBe(false);
    });
  });

  describe('uploadImage', () => {
    it('returns /storage/ path in LocalStack mode', async () => {
      vi.stubEnv('S3_ENDPOINT', 'http://localhost:4566');
      vi.stubEnv('R2_PUBLIC_URL', '');

      const { uploadImage } = await import('../storage');
      const url = await uploadImage(Buffer.from('test'), 'image/png');
      expect(url).toBe('/storage/uploads/test-uuid.png');
    });

    it('returns R2 public URL when configured', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_PUBLIC_URL', 'https://cdn.example.com');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');

      const { uploadImage } = await import('../storage');
      const url = await uploadImage(Buffer.from('test'), 'image/png');
      expect(url).toBe('https://cdn.example.com/uploads/test-uuid.png');
    });

    it('returns R2 storage URL as fallback', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_PUBLIC_URL', '');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
      vi.stubEnv('R2_BUCKET_NAME', 'tsumugi');

      const { uploadImage } = await import('../storage');
      const url = await uploadImage(Buffer.from('test'), 'image/png');
      expect(url).toBe(
        'https://abc123.r2.cloudflarestorage.com/tsumugi/uploads/test-uuid.png'
      );
    });
  });

  describe('uploadPdf', () => {
    it('returns /storage/ path in LocalStack mode', async () => {
      vi.stubEnv('S3_ENDPOINT', 'http://localhost:4566');
      vi.stubEnv('R2_PUBLIC_URL', '');

      const { uploadPdf } = await import('../storage');
      const url = await uploadPdf(Buffer.from('test'), 'contract');
      expect(url).toBe('/storage/pdfs/test-uuid-contract.pdf');
    });
  });
});
