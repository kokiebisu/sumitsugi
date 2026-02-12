import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

const { sendMessageNotification } =
  await import('../send-message-notification');

describe('sendMessageNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-key';
  });

  it('sends email with correct subject and recipient', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null });

    await sendMessageNotification({
      recipientEmail: 'tanaka@example.com',
      recipientName: '田中太郎',
      senderName: '山田花子',
      propertyTitle: '世田谷の物件',
      messagePreview: 'テストメッセージ',
      threadId: 'thread-1',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['tanaka@example.com'],
        subject: '【sumitsugi】山田花子さんから新着メッセージが届きました',
      })
    );
  });

  it('includes react email template', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'email-2' }, error: null });

    await sendMessageNotification({
      recipientEmail: 'tanaka@example.com',
      recipientName: '田中太郎',
      senderName: '山田花子',
      propertyTitle: '世田谷の物件',
      messagePreview: 'テストメッセージ',
      threadId: 'thread-1',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        react: expect.anything(),
      })
    );
  });

  it('throws on send error', async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'Rate limit exceeded' },
    });

    await expect(
      sendMessageNotification({
        recipientEmail: 'tanaka@example.com',
        recipientName: '田中太郎',
        senderName: '山田花子',
        propertyTitle: '世田谷の物件',
        messagePreview: 'テストメッセージ',
        threadId: 'thread-1',
      })
    ).rejects.toThrow('Failed to send email');
  });

  it('returns email data on success', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'email-3' }, error: null });

    const result = await sendMessageNotification({
      recipientEmail: 'tanaka@example.com',
      recipientName: '田中太郎',
      senderName: '山田花子',
      propertyTitle: '世田谷の物件',
      messagePreview: 'テストメッセージ',
      threadId: 'thread-1',
    });

    expect(result).toEqual({ id: 'email-3' });
  });
});
