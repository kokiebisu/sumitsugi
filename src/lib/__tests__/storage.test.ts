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
    GetObjectCommand: class MockGetObjectCommand {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
    DeleteObjectCommand: class MockDeleteObjectCommand {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
    DeleteObjectsCommand: class MockDeleteObjectsCommand {
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

    it('returns proxy URL as fallback when R2_PUBLIC_URL not set', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_PUBLIC_URL', '');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
      vi.stubEnv('R2_BUCKET_NAME', 'tsumugi');

      const { uploadImage } = await import('../storage');
      const url = await uploadImage(Buffer.from('test'), 'image/png');
      expect(url).toBe('/api/images/uploads/test-uuid.png');
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

  describe('deleteImage', () => {
    it('extracts key from full URL and deletes', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
      mockSend.mockResolvedValue({});

      const { deleteImage } = await import('../storage');
      await deleteImage('https://cdn.example.com/uploads/test-uuid.png');

      expect(mockSend).toHaveBeenCalled();
    });

    it('handles /api/images proxy URLs', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
      mockSend.mockResolvedValue({});

      const { deleteImage } = await import('../storage');
      await deleteImage('/api/images/uploads/test-uuid.png');

      expect(mockSend).toHaveBeenCalled();
    });

    it('handles /storage LocalStack URLs', async () => {
      vi.stubEnv('S3_ENDPOINT', 'http://localhost:4566');
      mockSend.mockResolvedValue({});

      const { deleteImage } = await import('../storage');
      await deleteImage('/storage/uploads/test-uuid.png');

      expect(mockSend).toHaveBeenCalled();
    });

    it('handles direct key paths', async () => {
      vi.stubEnv('S3_ENDPOINT', 'http://localhost:4566');
      mockSend.mockResolvedValue({});

      const { deleteImage } = await import('../storage');
      await deleteImage('uploads/test-uuid.png');

      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('deleteImages', () => {
    it('deletes multiple images in one batch', async () => {
      vi.stubEnv('S3_ENDPOINT', '');
      vi.stubEnv('R2_ACCOUNT_ID', 'abc123');
      vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
      vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
      mockSend.mockResolvedValue({});

      const { deleteImages } = await import('../storage');
      await deleteImages([
        'https://cdn.example.com/uploads/test-1.png',
        '/api/images/uploads/test-2.png',
      ]);

      expect(mockSend).toHaveBeenCalled();
    });

    it('returns early if no URLs provided', async () => {
      vi.stubEnv('S3_ENDPOINT', 'http://localhost:4566');
      mockSend.mockClear();

      const { deleteImages } = await import('../storage');
      await deleteImages([]);

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});
