import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

// Track mock select results - use different results for different calls
let selectCallIndex = 0;
let mockSelectResults: unknown[][] = [];

const createMockSelectChain = () => ({
  from: vi.fn(() => ({
    where: vi.fn(() => ({
      limit: vi.fn(() => {
        const result = mockSelectResults[selectCallIndex] || [];
        selectCallIndex++;
        return result;
      }),
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          offset: vi.fn(() => {
            const result = mockSelectResults[selectCallIndex] || [];
            selectCallIndex++;
            return result;
          }),
        })),
      })),
    })),
  })),
});

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: vi.fn() })),
    })),
    select: vi.fn(() => createMockSelectChain()),
  },
}));

vi.mock('@/db/schema', () => ({
  electronicContracts: { id: 'electronicContracts' },
  inquiries: { id: 'inquiries' },
}));

const validContractInput = {
  propertyId: 'prop-1',
  buyerId: 'buyer-1',
  contractType: 'handover_agreement',
  propertyTitle: 'テスト物件',
  sellerName: '田中太郎',
  sellerEmail: 'tanaka@example.com',
  buyerName: '鈴木花子',
  buyerEmail: 'suzuki@example.com',
  handoverFee: 50000,
  items: [
    {
      id: 'item-1',
      name: 'ソファ',
      condition: 'good',
      photos: ['https://example.com/sofa.jpg'],
    },
  ],
};

const mockInquiry = { id: 'inq-1', propertyId: 'prop-1', userId: 'buyer-1' };

describe('POST /api/contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectCallIndex = 0;
    mockSelectResults = [];
  });

  it('returns 401 if not authenticated', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validContractInput),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'ログインが必要です' });
  });

  it('returns 400 if propertyId missing', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validContractInput, propertyId: undefined }),
    });

    expect((await POST(req)).status).toBe(400);
  });

  it('returns 400 if buyerId missing', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validContractInput, buyerId: undefined }),
    });

    expect((await POST(req)).status).toBe(400);
  });

  it('returns 400 if invalid email', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...validContractInput,
        sellerEmail: 'not-an-email',
      }),
    });

    expect((await POST(req)).status).toBe(400);
  });

  it('returns 400 if negative handoverFee', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validContractInput, handoverFee: -1000 }),
    });

    expect((await POST(req)).status).toBe(400);
  });

  it('returns 403 if no inquiry relationship exists', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    // Return empty array = no inquiry found
    mockSelectResults = [[]];

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validContractInput),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain('問い合わせ');
  });

  it('creates contract with valid input and existing inquiry', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    // First select: inquiry relationship check returns a valid inquiry
    mockSelectResults = [[mockInquiry]];

    const created = {
      id: 'contract-1',
      ...validContractInput,
      sellerId: 'u1',
      status: 'draft',
    };
    const { db } = await import('@/db');
    const mockReturning = vi.fn().mockResolvedValue([created]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validContractInput),
    });

    const res = await POST(req);
    const data = (await res.json()) as { success: boolean; data: any };
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('draft');
  });

  it('returns 500 on DB error', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    // Inquiry check passes
    mockSelectResults = [[mockInquiry]];

    const { db } = await import('@/db');
    const mockReturning = vi.fn().mockRejectedValue(new Error('DB fail'));
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validContractInput),
    });

    expect((await POST(req)).status).toBe(500);
  });

  it('defaults contractType to handover_agreement', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    mockSelectResults = [[mockInquiry]];

    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contractType: _ct, ...inputWithoutType } = validContractInput;
    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(inputWithoutType),
    });

    await POST(req);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ contractType: 'handover_agreement' })
    );
  });

  it('sets status to draft on creation', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    mockSelectResults = [[mockInquiry]];

    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validContractInput),
    });

    await POST(req);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' })
    );
  });

  it('includes audit trail entry on creation', async () => {
    const { POST } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    mockSelectResults = [[mockInquiry]];

    const { db } = await import('@/db');
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ id: 'x', status: 'draft' }]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    const req = new Request('http://localhost/api/contracts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validContractInput),
    });

    await POST(req);
    const callArgs = mockValues.mock.calls[0][0];
    expect(callArgs.auditTrail).toHaveLength(1);
    expect(callArgs.auditTrail[0].action).toBe('created');
    expect(callArgs.auditTrail[0].performedBy).toBe('u1');
  });
});

describe('GET /api/contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectCallIndex = 0;
    mockSelectResults = [];
  });

  it('returns 401 if not authenticated', async () => {
    const { GET } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

    const req = new Request('http://localhost/api/contracts');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
