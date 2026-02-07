import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendAgreementToManagementCompany } from '../management-company';
import { db } from '@/db';

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'msg_test123' }),
}));

vi.mock('@/db', () => ({
  db: {
    query: {
      properties: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('sendAgreementToManagementCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPropertyId = 'prop-123';
  const mockPdfUrl = 'https://example.com/agreement.pdf';

  it('should send email and log when management company details are present', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      title: '世田谷区の家具付き物件',
      area: '東京都世田谷区三軒茶屋1-1-1',
      managementCompanyName: '株式会社ABC管理',
      managementCompanyEmail: 'abc@management.co.jp',
      handoverHost: { name: '田中太郎' },
    } as any);

    const { sendEmail } = await import('@/lib/email/send');

    const result = await sendAgreementToManagementCompany({
      propertyId: mockPropertyId,
      pdfUrl: mockPdfUrl,
    });

    expect(result.success).toBe(true);
    expect(result.emailLogId).toBeDefined();
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'abc@management.co.jp',
        subject: expect.stringContaining('残置物同意書'),
      })
    );
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.update).toHaveBeenCalledTimes(1);
  });

  it('should fail if property not found', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue(undefined);

    const result = await sendAgreementToManagementCompany({
      propertyId: mockPropertyId,
      pdfUrl: mockPdfUrl,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Property not found');
  });

  it('should fail if management company email is missing', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      title: '物件A',
      managementCompanyName: '管理会社A',
      managementCompanyEmail: null,
    } as any);

    const result = await sendAgreementToManagementCompany({
      propertyId: mockPropertyId,
      pdfUrl: mockPdfUrl,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Management company email not registered');
  });

  it('should fail if management company name is missing', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      title: '物件A',
      managementCompanyName: null,
      managementCompanyEmail: 'test@example.com',
    } as any);

    const result = await sendAgreementToManagementCompany({
      propertyId: mockPropertyId,
      pdfUrl: mockPdfUrl,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Management company name not registered');
  });

  it('should reject invalid input with Zod validation', async () => {
    const result = await sendAgreementToManagementCompany({
      propertyId: '',
      pdfUrl: 'not-a-url',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('入力が不正です');
  });

  it('should handle email sending errors gracefully', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      title: '物件A',
      area: '東京都',
      managementCompanyName: '管理会社A',
      managementCompanyEmail: 'test@example.com',
      handoverHost: { name: '山田花子' },
    } as any);

    const { sendEmail } = await import('@/lib/email/send');
    vi.mocked(sendEmail).mockRejectedValueOnce(
      new Error('Failed to send email: rate limited')
    );

    const result = await sendAgreementToManagementCompany({
      propertyId: mockPropertyId,
      pdfUrl: mockPdfUrl,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to send email: rate limited');
  });

  it('should use property title when area is not available', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      title: 'テスト物件',
      area: null,
      managementCompanyName: '管理会社B',
      managementCompanyEmail: 'test@example.com',
      handoverHost: null,
    } as any);

    const { sendEmail } = await import('@/lib/email/send');

    const result = await sendAgreementToManagementCompany({
      propertyId: mockPropertyId,
      pdfUrl: mockPdfUrl,
    });

    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
      })
    );
  });
});
