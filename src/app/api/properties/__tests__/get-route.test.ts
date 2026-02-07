import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockOffset = vi.fn();

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: vi.fn() })),
    })),
    select: mockSelect,
  },
}));

vi.mock('@/db/schema', () => ({
  properties: { status: 'status', createdAt: 'createdAt' },
}));

describe('GET /api/properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Chain: select() -> from() -> where() -> orderBy() -> limit() -> offset()
    mockOffset.mockResolvedValue([
      { id: '1', title: 'Test Property', status: 'public' },
    ]);
    mockLimit.mockReturnValue({ offset: mockOffset });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  it('returns public properties with pagination', async () => {
    // Mock count query (second call to select)
    let callCount = 0;
    mockSelect.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Data query
        return { from: mockFrom };
      }
      // Count query
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      };
    });

    const { GET } = await import('../route');
    const req = new Request('http://localhost/api/properties');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('pagination');
    expect(body.pagination).toHaveProperty('page', 1);
    expect(body.pagination).toHaveProperty('limit', 20);
  });

  it('respects page and limit params', async () => {
    let callCount = 0;
    mockSelect.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: mockFrom };
      }
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 50 }]),
        }),
      };
    });

    const { GET } = await import('../route');
    const req = new Request('http://localhost/api/properties?page=2&limit=10');
    const res = await GET(req);
    const body = await res.json();

    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(10);
    expect(body.pagination.totalPages).toBe(5);
  });

  it('returns 500 on error', async () => {
    mockSelect.mockImplementation(() => {
      throw new Error('DB error');
    });

    const { GET } = await import('../route');
    const req = new Request('http://localhost/api/properties');
    const res = await GET(req);

    expect(res.status).toBe(500);
  });
});
