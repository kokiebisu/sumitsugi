import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/db', () => ({
  db: {
    select: mockSelect,
  },
}));

vi.mock('@/db/schema', () => ({
  properties: { userId: 'userId', createdAt: 'createdAt' },
}));

describe('GET /api/properties/my', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderBy.mockResolvedValue([]);
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  it('returns 401 if not authenticated', async () => {
    const { GET } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

    const req = new Request('http://localhost/api/properties/my');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns user properties including drafts', async () => {
    const { GET } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    mockOrderBy.mockResolvedValue([
      { id: '1', title: 'My Property', status: 'draft' },
      { id: '2', title: 'Published', status: 'public' },
    ]);

    const req = new Request('http://localhost/api/properties/my');
    const res = await GET(req);
    const body = (await res.json()) as { data: { status: string }[] };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].status).toBe('draft');
  });

  it('returns 500 on error', async () => {
    const { GET } = await import('../route');
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: 's1', userId: 'u1' },
      user: { id: 'u1' },
    } as any);

    mockSelect.mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = new Request('http://localhost/api/properties/my');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
