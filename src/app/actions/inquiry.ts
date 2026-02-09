'use server';

import zod from 'zod';
import { getPropertyById } from '@/lib/data';
import { sendEmail } from '@/lib/email/send';
import { InquiryNotification } from '@/lib/email/templates/inquiry-notification';
import { InquiryConfirmation } from '@/lib/email/templates/inquiry-confirmation';
import { siteConfig } from '@/lib/site-config';

const submitInquirySchema = zod.object({
  applicantName: zod.string().min(1, '名前は必須です'),
  applicantEmail: zod.string().email('有効なメールアドレスを入力してください'),
  reason: zod.string().min(10, '理由は10文字以上で入力してください'),
  propertyId: zod.string().min(1, '物件IDは必須です'),
  questions: zod.string().optional(),
  duration: zod.string().max(100).optional(),
});

export interface SubmitInquiryInput {
  applicantName: string;
  applicantEmail: string;
  reason: string;
  propertyId: string;
  questions?: string;
  duration?: string;
}

export interface SubmitInquiryResult {
  success: boolean;
  error?: string;
}

/**
 * Submit an inquiry for a property.
 *
 * Sends a notification email to the seller (前の住人) and
 * a confirmation email to the applicant (次の住人候補).
 *
 * Phase 1: Uses mock data for property lookup.
 * TODO Phase 2: Replace with database lookup and auth checks.
 * TODO Phase 2: Add rate limiting to prevent email flooding.
 */
export async function submitInquiry(
  input: SubmitInquiryInput
): Promise<SubmitInquiryResult> {
  try {
    const validated = submitInquirySchema.parse(input);

    const property = getPropertyById(validated.propertyId);
    if (!property) {
      return { success: false, error: '物件が見つかりません' };
    }

    const sellerName = property.handoverHost?.name ?? '前の住人';
    const baseUrl = siteConfig.url;
    const propertyUrl = `${baseUrl}/properties/${property.id}`;
    const dashboardUrl = `${baseUrl}/dashboard`;
    const message = validated.questions ?? validated.reason;

    // Send both emails concurrently for better performance
    const [sellerResult, applicantResult] = await Promise.allSettled([
      sendEmail({
        to: siteConfig.company.email,
        subject: `【tsumugi】${property.title}に問い合わせが届きました`,
        react: InquiryNotification({
          sellerName,
          buyerName: validated.applicantName,
          propertyTitle: property.title,
          dashboardUrl,
          message,
        }),
        replyTo: validated.applicantEmail,
      }),
      sendEmail({
        to: validated.applicantEmail,
        subject: `【tsumugi】${property.title}への問い合わせを受け付けました`,
        react: InquiryConfirmation({
          buyerName: validated.applicantName,
          propertyTitle: property.title,
          propertyUrl,
          message,
        }),
      }),
    ]);

    if (
      sellerResult.status === 'rejected' &&
      applicantResult.status === 'rejected'
    ) {
      return {
        success: false,
        error:
          'お問い合わせの送信に失敗しました。しばらくしてからお試しください。',
      };
    }

    if (sellerResult.status === 'rejected') {
      return {
        success: false,
        error:
          'お問い合わせの送信に失敗しました。しばらくしてからお試しください。',
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      };
    }
    return {
      success: false,
      error:
        'お問い合わせの送信に失敗しました。しばらくしてからお試しください。',
    };
  }
}
