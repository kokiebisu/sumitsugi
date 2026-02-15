import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../verify/route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock database
vi.mock('@/db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock Twilio
vi.mock('@/lib/twilio', () => ({
  verifyOtp: vi.fn(async (phoneNumber: string, code: string) => {
    return code === '123456';
  }),
}));

import { auth } from '@/lib/auth';
import { verifyOtp } from '@/lib/twilio';
import { db } from '@/db';

describe('POST /api/phone/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+819012345678',
        code: '123456',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid phone number format', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    const request = new NextRequest('http://localhost:3000/api/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '09012345678', // Invalid format
        code: '123456',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should return 400 for invalid code format', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    const invalidCodes = [
      '12345', // Too short
      '1234567', // Too long
      'abcdef', // Non-numeric
      '12345a', // Mixed
    ];

    for (const code of invalidCodes) {
      const request = new NextRequest(
        'http://localhost:3000/api/phone/verify',
        {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: '+819012345678',
            code,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    }
  });

  it('should return 400 for invalid verification code', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    const request = new NextRequest('http://localhost:3000/api/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+819012345678',
        code: '000000', // Wrong code
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid or expired verification code');
  });

  it('should verify phone number successfully with valid code', async () => {
    const userId = 'user-1';
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    const request = new NextRequest('http://localhost:3000/api/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+819012345678',
        code: '123456',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(verifyOtp).toHaveBeenCalledWith('+819012345678', '123456');
    expect(db.update).toHaveBeenCalled();
  });

  it('should update user phone number and verification status', async () => {
    const userId = 'user-1';
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    const mockUpdate = vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    }));
    vi.mocked(db.update).mockImplementation(mockUpdate);

    const phoneNumber = '+819012345678';
    const request = new NextRequest('http://localhost:3000/api/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber,
        code: '123456',
      }),
    });

    await POST(request);

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    vi.mocked(db.update).mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new NextRequest('http://localhost:3000/api/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+819012345678',
        code: '123456',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to verify OTP');
  });
});
