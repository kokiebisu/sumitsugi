import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/twilio';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format'),
});

export async function POST(request: NextRequest) {
  try {
    // Get session to ensure user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid phone number format', details: result.error.errors },
        { status: 400 }
      );
    }

    const { phoneNumber } = result.data;

    // Send OTP via Twilio
    const verificationSid = await sendOtp(phoneNumber);

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully',
        verificationSid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
