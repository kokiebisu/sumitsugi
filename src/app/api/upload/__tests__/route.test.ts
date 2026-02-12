import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '../route';

const mockAuth = vi.hoisted(() => ({
  api: {
    getSession: vi.fn(),
  },
}));

const mockStorage = vi.hoisted(() => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  deleteImages: vi.fn(),
  isStorageConfigured: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/storage', () => mockStorage);

describe('/api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.isStorageConfigured.mockReturnValue(true);
  });

  describe('POST', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: new FormData(),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('ログインが必要です');
    });

    it('returns 503 if storage not configured', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
      mockStorage.isStorageConfigured.mockReturnValue(false);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: new FormData(),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('ストレージが設定されていません');
    });

    it('returns 400 if no files provided', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });

      const formData = new FormData();
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ファイルが選択されていません');
    });

    it('uploads files and returns URLs', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
      mockStorage.uploadImage.mockResolvedValue(
        'https://cdn.example.com/uploads/test.png'
      );

      const formData = new FormData();
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      formData.append('files', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.urls).toEqual(['https://cdn.example.com/uploads/test.png']);
    });
  });

  describe('DELETE', () => {
    it('returns 401 if not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const request = new Request('http://localhost/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ urls: ['https://cdn.example.com/test.png'] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('ログインが必要です');
    });

    it('returns 503 if storage not configured', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
      mockStorage.isStorageConfigured.mockReturnValue(false);

      const request = new Request('http://localhost/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ urls: ['https://cdn.example.com/test.png'] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('ストレージが設定されていません');
    });

    it('returns 400 if no URLs provided', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });

      const request = new Request('http://localhost/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ urls: [] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('削除するURLが指定されていません');
    });

    it('deletes single image', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
      mockStorage.deleteImage.mockResolvedValue(undefined);

      const request = new Request('http://localhost/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ urls: ['https://cdn.example.com/test.png'] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockStorage.deleteImage).toHaveBeenCalledWith(
        'https://cdn.example.com/test.png'
      );
    });

    it('deletes multiple images', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
      mockStorage.deleteImages.mockResolvedValue(undefined);

      const urls = [
        'https://cdn.example.com/test1.png',
        'https://cdn.example.com/test2.png',
      ];

      const request = new Request('http://localhost/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ urls }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockStorage.deleteImages).toHaveBeenCalledWith(urls);
    });

    it('returns 500 on deletion error', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
      });
      mockStorage.deleteImage.mockRejectedValue(new Error('Delete failed'));

      const request = new Request('http://localhost/api/upload', {
        method: 'DELETE',
        body: JSON.stringify({ urls: ['https://cdn.example.com/test.png'] }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('削除に失敗しました');
    });
  });
});
