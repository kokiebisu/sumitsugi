'use server';

import { randomUUID } from 'crypto';
import zod from 'zod';
import { db } from '@/db';
import { properties, emailLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/send';
import { ManagementCompanyAgreement } from '@/lib/email/templates/management-company-agreement';
import { revalidatePath } from 'next/cache';

const sendAgreementSchema = zod.object({
  propertyId: zod.string().min(1),
  pdfUrl: zod.string().url(),
});

export interface SendAgreementInput {
  propertyId: string;
  pdfUrl: string;
}

export interface SendAgreementResult {
  success: boolean;
  emailLogId?: string;
  error?: string;
}

/**
 * Send the leftover items agreement PDF to the management company.
 *
 * Looks up the property's management company email, sends the agreement
 * email with a PDF download link, and records the send in email_logs.
 *
 * TODO: Add authentication/authorization checks when auth system is implemented.
 */
export async function sendAgreementToManagementCompany(
  input: SendAgreementInput
): Promise<SendAgreementResult> {
  try {
    const validated = sendAgreementSchema.parse(input);
    const { propertyId, pdfUrl } = validated;

    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    if (!property.managementCompanyEmail) {
      return {
        success: false,
        error: 'Management company email not registered',
      };
    }

    if (!property.managementCompanyName) {
      return {
        success: false,
        error: 'Management company name not registered',
      };
    }

    const subject = `【tsumugi】残置物同意書のご送付 - ${property.title}`;
    const emailLogId = randomUUID();

    const sellerName = property.handoverHost?.name ?? '前の住人';

    const emailResult = await sendEmail({
      to: property.managementCompanyEmail,
      subject,
      react: ManagementCompanyAgreement({
        managementCompanyName: property.managementCompanyName,
        propertyAddress: property.area ?? property.title,
        sellerName,
        pdfDownloadUrl: pdfUrl,
        roomNumber: undefined,
      }),
    });

    await db.insert(emailLogs).values({
      id: emailLogId,
      propertyId,
      recipientEmail: property.managementCompanyEmail,
      emailType: 'management_company_agreement',
      subject,
      status: 'sent',
      pdfUrl,
      metadata: {
        resendMessageId: emailResult?.id,
      },
    });

    await db
      .update(properties)
      .set({ managementConsultedAt: new Date(), updatedAt: new Date() })
      .where(eq(properties.id, propertyId));

    revalidatePath(`/properties/${propertyId}`);

    return {
      success: true,
      emailLogId,
    };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return {
        success: false,
        error: `入力が不正です: ${error.errors.map((e) => e.message).join(', ')}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
