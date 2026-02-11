import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock('@/lib/pdf/render', () => ({ renderPdf: vi.fn() }));
vi.mock('@/lib/pdf/templates/consultation-document', () => ({
  ConsultationDocument: vi.fn(),
}));
vi.mock('@/lib/pdf/qr-code', () => ({
  generateQrCodeDataUrl: vi
    .fn()
    .mockResolvedValue('data:image/png;base64,MOCK'),
  FAQ_PAGE_URL: 'https://tsumugi.com/for-managers',
}));
vi.mock('@/lib/storage', () => ({
  uploadPdf: vi.fn(),
  isStorageConfigured: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { renderPdf } from '@/lib/pdf/render';
import { uploadPdf, isStorageConfigured } from '@/lib/storage';
import { POST } from '../generate/route';

const validInput = {
  propertyName: 'テスト物件',
  propertyAddress: '東京都渋谷区1-2-3',
  moveOutDate: '2026-03-31',
  sellerName: '田中太郎',
  furnitureItems: [
    { name: 'ソファ', category: 'リビング', description: '3人掛け' },
    { name: 'テーブル', category: 'ダイニング' },
  ],
};

function createRequest(body: unknown): Request {
  return new Request('http://localhost/api/pdf/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockAuth(userId?: string) {
  if (!userId) {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    return;
  }
  vi.mocked(auth.api.getSession).mockResolvedValue({
    session: { id: 's1', userId },
    user: { id: userId },
  } as never);
}

function mockStorageReady() {
  vi.mocked(isStorageConfigured).mockReturnValue(true);
}

function mockPdfSuccess(url = 'https://r2.example.com/pdfs/test.pdf') {
  vi.mocked(renderPdf).mockResolvedValue(Buffer.from('pdf'));
  vi.mocked(uploadPdf).mockResolvedValue(url);
}

describe('POST /api/pdf/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    mockAuth();
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(401);
    expect(((await res.json()) as { error: string }).error).toBe(
      'ログインが必要です'
    );
  });

  it('returns 503 if storage is not configured', async () => {
    mockAuth('u1');
    vi.mocked(isStorageConfigured).mockReturnValue(false);
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: string }).error).toBe(
      'ストレージが設定されていません'
    );
  });

  it('returns 400 if propertyName is missing', async () => {
    mockAuth('u1');
    mockStorageReady();
    const { propertyName: _pn, ...input } = validInput;
    const res = await POST(createRequest(input));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain(
      'バリデーション'
    );
  });

  it('returns 400 if propertyAddress is missing', async () => {
    mockAuth('u1');
    mockStorageReady();
    const { propertyAddress: _pa, ...input } = validInput;
    expect((await POST(createRequest(input))).status).toBe(400);
  });

  it('returns 400 if moveOutDate is invalid format', async () => {
    mockAuth('u1');
    mockStorageReady();
    const res = await POST(
      createRequest({ ...validInput, moveOutDate: 'not-a-date' })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 if furnitureItems is empty array', async () => {
    mockAuth('u1');
    mockStorageReady();
    const res = await POST(
      createRequest({ ...validInput, furnitureItems: [] })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 if furniture item missing name', async () => {
    mockAuth('u1');
    mockStorageReady();
    const res = await POST(
      createRequest({
        ...validInput,
        furnitureItems: [{ category: 'リビング' }],
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON body', async () => {
    mockAuth('u1');
    mockStorageReady();
    const req = new Request('http://localhost/api/pdf/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toContain(
      'リクエストの解析に失敗しました'
    );
  });

  it('generates PDF and uploads to R2 successfully', async () => {
    mockAuth('u1');
    mockStorageReady();
    mockPdfSuccess('https://r2.example.com/pdfs/test.pdf');
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; url: string };
    expect(data.success).toBe(true);
    expect(data.url).toBe('https://r2.example.com/pdfs/test.pdf');
  });

  it('calls renderPdf with consultation document element', async () => {
    mockAuth('u1');
    mockStorageReady();
    mockPdfSuccess();
    await POST(createRequest(validInput));
    expect(renderPdf).toHaveBeenCalledOnce();
  });

  it('calls uploadPdf with generated buffer', async () => {
    mockAuth('u1');
    mockStorageReady();
    const pdfBuffer = Buffer.from('generated-pdf');
    vi.mocked(renderPdf).mockResolvedValue(pdfBuffer);
    vi.mocked(uploadPdf).mockResolvedValue('https://r2.example.com/test.pdf');
    await POST(createRequest(validInput));
    expect(uploadPdf).toHaveBeenCalledWith(
      pdfBuffer,
      expect.stringContaining('consultation')
    );
  });

  it('returns 500 if PDF rendering fails', async () => {
    mockAuth('u1');
    mockStorageReady();
    vi.mocked(renderPdf).mockRejectedValue(new Error('Render failed'));
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(500);
    expect(((await res.json()) as { error: string }).error).toBe(
      'PDF生成に失敗しました'
    );
  });

  it('returns 500 if R2 upload fails', async () => {
    mockAuth('u1');
    mockStorageReady();
    vi.mocked(renderPdf).mockResolvedValue(Buffer.from('pdf'));
    vi.mocked(uploadPdf).mockRejectedValue(new Error('Upload failed'));
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(500);
    expect(((await res.json()) as { error: string }).error).toBe(
      'PDF生成に失敗しました'
    );
  });

  it('retries on transient upload failure then succeeds', async () => {
    mockAuth('u1');
    mockStorageReady();
    vi.mocked(renderPdf).mockResolvedValue(Buffer.from('pdf'));
    vi.mocked(uploadPdf)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('https://r2.example.com/retry-success.pdf');
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(200);
    expect(uploadPdf).toHaveBeenCalledTimes(3);
  });

  it('fails after exhausting all retries', async () => {
    mockAuth('u1');
    mockStorageReady();
    vi.mocked(renderPdf).mockResolvedValue(Buffer.from('pdf'));
    vi.mocked(uploadPdf).mockRejectedValue(new Error('Persistent error'));
    const res = await POST(createRequest(validInput));
    expect(res.status).toBe(500);
    expect(uploadPdf).toHaveBeenCalledTimes(3);
  });

  it('accepts optional sellerName field', async () => {
    mockAuth('u1');
    mockStorageReady();
    mockPdfSuccess();
    const { sellerName: _sn, ...input } = validInput;
    expect((await POST(createRequest(input))).status).toBe(200);
  });
});
