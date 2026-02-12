import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: vi.fn() })),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  properties: {},
}));

describe('POST /api/properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'test' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'ログインが必要です' });
  });

  it('returns 400 if title missing', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('returns 400 if title empty', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('creates property with title only', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const created = {
      id: 'test-uuid-1234',
      userId: 'u1',
      title: 'テスト',
      images: [],
      status: 'draft',
    };
    const { db } = await import('@/db');
    const mockReturning = vi.fn().mockResolvedValue([created]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    });
    const res = await POST(req);
    const data = (await res.json()) as {
      success: boolean;
      data: { title: string; status: string };
    };
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('テスト');
    expect(data.data.status).toBe('draft');
  });

  it('creates property with all fields', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const input = {
      title: '渋谷のお部屋',
      summary: '好立地',
      images: ['https://example.com/1.jpg'],
      handoverFee: 50000,
      rent: 120000,
      managementFee: 10000,
      area: '渋谷区',
      layout: '1LDK',
      condition: 'excellent',
      landlordConsent: { status: 'approved' },
    };
    const created = {
      id: 'test-uuid-1234',
      userId: 'u1',
      ...input,
      status: 'draft',
    };
    const { db } = await import('@/db');
    const mockReturning = vi.fn().mockResolvedValue([created]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    const res = await POST(req);
    const data = (await res.json()) as { data: { title: string } };
    expect(res.status).toBe(201);
    expect(data.data.title).toBe('渋谷のお部屋');
  });

  it('returns 400 for invalid condition', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト', condition: 'bad' }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const { db } = await import('@/db');
    const mockReturning = vi.fn().mockRejectedValue(new Error('DB fail'));
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    });
    expect((await POST(req)).status).toBe(500);
  });

  it('defaults images to empty array', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', images: [], status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    });
    await POST(req);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ images: [] })
    );
  });

  it('returns 400 for invalid landlordConsent status', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'テスト',
        landlordConsent: { status: 'unknown' },
      }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('defaults landlordConsent to pending when not provided', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    });
    await POST(req);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        landlordConsent: { status: 'pending' },
      })
    );
  });

  it('accepts landlordConsent with conditional status and fields', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const consent = {
      status: 'conditional',
      approvedItems: ['sofa'],
      rejectedItems: ['lighting'],
      conditions: '退去時清掃必要',
    };
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト', landlordConsent: consent }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ landlordConsent: consent })
    );
  });

  it('defaults status to draft when not provided', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    });
    await POST(req);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' })
    );
  });

  it('accepts public status from client', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);
    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'public' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
    const req = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'テスト', status: 'public' }),
    });
    await POST(req);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'public' })
    );
  });
});
