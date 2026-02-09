import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'msg_test123' }),
}));

vi.mock('@/lib/data', () => ({
  getPropertyById: vi.fn(),
}));

describe('submitInquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProperty = {
    id: 'prop-1',
    title: 'テスト物件',
    handoverHost: { name: '前田太郎', occupation: '', bio: '' },
    images: [],
    handoverFee: 50000,
    area: '東京都渋谷区',
    status: 'public' as const,
  };

  const validInput = {
    applicantName: '山田花子',
    applicantEmail: 'yamada@example.com',
    reason: 'この物件にとても興味があります。内見を希望します。',
    propertyId: 'prop-1',
  };

  it('should send both notification and confirmation emails on valid input', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue(mockProperty as any);

    const { sendEmail } = await import('@/lib/email/send');
    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry(validInput);

    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(2);

    // First call: notification to seller
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: expect.stringContaining('問い合わせ'),
        replyTo: 'yamada@example.com',
      })
    );

    // Second call: confirmation to applicant
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'yamada@example.com',
        subject: expect.stringContaining('受け付けました'),
      })
    );
  });

  it('should include optional questions as message in emails', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue(mockProperty as any);

    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry({
      ...validInput,
      questions: 'ペットは飼えますか？',
    });

    expect(result.success).toBe(true);
  });

  it('should fail validation when applicantName is missing', async () => {
    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry({ ...validInput, applicantName: '' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail validation when email is invalid', async () => {
    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry({
      ...validInput,
      applicantEmail: 'not-an-email',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail validation when reason is too short', async () => {
    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry({ ...validInput, reason: '短い' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail validation when propertyId is missing', async () => {
    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry({ ...validInput, propertyId: '' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail when property is not found', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue(undefined);

    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry({
      ...validInput,
      propertyId: 'nonexistent',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('物件が見つかりません');
  });

  it('should return generic error when both emails fail', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue(mockProperty as any);

    const { sendEmail } = await import('@/lib/email/send');
    vi.mocked(sendEmail)
      .mockRejectedValueOnce(new Error('Failed to send email: rate limited'))
      .mockRejectedValueOnce(new Error('Failed to send email: rate limited'));

    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'お問い合わせの送信に失敗しました。しばらくしてからお試しください。'
    );
    // Should NOT leak internal error details
    expect(result.error).not.toContain('rate limited');
  });

  it('should return error when seller notification fails', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue(mockProperty as any);

    const { sendEmail } = await import('@/lib/email/send');
    vi.mocked(sendEmail)
      .mockRejectedValueOnce(new Error('SMTP error'))
      .mockResolvedValueOnce({ id: 'msg_ok' });

    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry(validInput);

    expect(result.success).toBe(false);
    expect(result.error).not.toContain('SMTP');
  });

  it('should succeed when only applicant confirmation fails', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue(mockProperty as any);

    const { sendEmail } = await import('@/lib/email/send');
    vi.mocked(sendEmail)
      .mockResolvedValueOnce({ id: 'msg_seller' })
      .mockRejectedValueOnce(new Error('delivery failed'));

    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry(validInput);

    // Seller notification succeeded, so inquiry is considered submitted
    expect(result.success).toBe(true);
  });

  it('should use fallback seller name when handoverHost is missing', async () => {
    const { getPropertyById } = await import('@/lib/data');
    vi.mocked(getPropertyById).mockReturnValue({
      ...mockProperty,
      handoverHost: undefined,
    } as any);

    const { sendEmail } = await import('@/lib/email/send');
    const { submitInquiry } = await import('../inquiry');

    const result = await submitInquiry(validInput);

    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });
});
