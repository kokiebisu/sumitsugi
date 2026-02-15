import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../send-otp/route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock Twilio
vi.mock('@/lib/twilio', () => ({
  sendOtp: vi.fn(async (phoneNumber: string) => {
    if (phoneNumber.startsWith('+')) {
      return 'mock-verification-sid';
    }
    throw new Error('Invalid phone number');
  }),
}));

import { auth } from '@/lib/auth';
import { sendOtp } from '@/lib/twilio';

describe('POST /api/phone/send-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/phone/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '+819012345678' }),
      }
    );

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

    const invalidNumbers = [
      '09012345678', // Missing country code
      '+81-90-1234-5678', // Has dashes
      'invalid', // Not a number
      '', // Empty
    ];

    for (const phoneNumber of invalidNumbers) {
      const request = new NextRequest(
        'http://localhost:3000/api/phone/send-otp',
        {
          method: 'POST',
          body: JSON.stringify({ phoneNumber }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid phone number format');
    }
  });

  it('should send OTP successfully for valid phone number', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    const request = new NextRequest(
      'http://localhost:3000/api/phone/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '+819012345678' }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.verificationSid).toBe('mock-verification-sid');
    expect(sendOtp).toHaveBeenCalledWith('+819012345678');
  });

  it('should handle Twilio errors gracefully', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    vi.mocked(sendOtp).mockRejectedValue(new Error('Twilio error'));

    const request = new NextRequest(
      'http://localhost:3000/api/phone/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '+819012345678' }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to send OTP');
  });

  it('should accept international phone numbers', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    } as never);

    // Reset the mock to resolve successfully
    vi.mocked(sendOtp).mockResolvedValue('mock-verification-sid');

    const internationalNumbers = [
      '+14155552671', // US
      '+447911123456', // UK
      '+819012345678', // Japan
      '+33612345678', // France
    ];

    for (const phoneNumber of internationalNumbers) {
      const request = new NextRequest(
        'http://localhost:3000/api/phone/send-otp',
        {
          method: 'POST',
          body: JSON.stringify({ phoneNumber }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });
});
