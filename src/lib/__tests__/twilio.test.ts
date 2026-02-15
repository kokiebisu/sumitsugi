import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendOtp, verifyOtp } from '../twilio';

// Mock Twilio client
vi.mock('twilio', () => {
  return {
    Twilio: vi.fn(() => ({
      verify: {
        v2: {
          services: vi.fn(() => ({
            verifications: {
              create: vi.fn(async ({ to, channel }) => ({
                sid: 'mock-verification-sid',
                to,
                channel,
                status: 'pending',
              })),
            },
            verificationChecks: {
              create: vi.fn(async ({ to, code }) => ({
                to,
                status: code === '123456' ? 'approved' : 'pending',
              })),
            },
          })),
        },
      },
    })),
  };
});

describe('Twilio Verify Service', () => {
  beforeEach(() => {
    // Reset environment variables
    vi.resetModules();
  });

  describe('sendOtp', () => {
    it('should send OTP in development mode', async () => {
      const phoneNumber = '+819012345678';
      const result = await sendOtp(phoneNumber);

      expect(result).toBe('dev-mode-verification');
    });

    it('should handle phone numbers in E.164 format', async () => {
      const phoneNumbers = [
        '+819012345678', // Japan
        '+14155552671', // US
        '+447911123456', // UK
      ];

      for (const phoneNumber of phoneNumbers) {
        const result = await sendOtp(phoneNumber);
        expect(result).toBeTruthy();
      }
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid 6-digit OTP in development mode', async () => {
      const phoneNumber = '+819012345678';
      const code = '123456';

      const result = await verifyOtp(phoneNumber, code);
      expect(result).toBe(true);
    });

    it('should reject invalid OTP format in development mode', async () => {
      const phoneNumber = '+819012345678';

      // Test invalid formats
      expect(await verifyOtp(phoneNumber, '12345')).toBe(false); // Too short
      expect(await verifyOtp(phoneNumber, '1234567')).toBe(false); // Too long
      expect(await verifyOtp(phoneNumber, 'abcdef')).toBe(false); // Non-numeric
      expect(await verifyOtp(phoneNumber, '12345a')).toBe(false); // Mixed
    });

    it('should accept any valid 6-digit code in development mode', async () => {
      const phoneNumber = '+819012345678';
      const codes = ['000000', '123456', '999999', '654321'];

      for (const code of codes) {
        const result = await verifyOtp(phoneNumber, code);
        expect(result).toBe(true);
      }
    });
  });
});
