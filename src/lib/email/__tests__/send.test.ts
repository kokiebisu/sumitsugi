import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';

const mockSend = vi.fn();

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

// Import after mock setup
const { sendEmail } = await import('../send');

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-key';
  });

  it('sends email with correct parameters', async () => {
    const mockElement = createElement('div', null, 'Test');
    mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      react: mockElement,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['test@example.com'],
        subject: 'Test Subject',
        react: mockElement,
      })
    );
    expect(result).toEqual({ id: 'email-123' });
  });

  it('handles array of recipients', async () => {
    const mockElement = createElement('div', null, 'Test');
    mockSend.mockResolvedValueOnce({ data: { id: 'email-456' }, error: null });

    await sendEmail({
      to: ['a@test.com', 'b@test.com'],
      subject: 'Multi',
      react: mockElement,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['a@test.com', 'b@test.com'],
      })
    );
  });

  it('passes replyTo when provided', async () => {
    const mockElement = createElement('div', null, 'Test');
    mockSend.mockResolvedValueOnce({ data: { id: 'email-789' }, error: null });

    await sendEmail({
      to: 'test@example.com',
      subject: 'Reply Test',
      react: mockElement,
      replyTo: 'reply@example.com',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'reply@example.com',
      })
    );
  });

  it('throws on send error', async () => {
    const mockElement = createElement('div', null, 'Test');
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid API key' },
    });

    await expect(
      sendEmail({
        to: 'test@example.com',
        subject: 'Fail',
        react: mockElement,
      })
    ).rejects.toThrow('Failed to send email: Invalid API key');
  });
});
