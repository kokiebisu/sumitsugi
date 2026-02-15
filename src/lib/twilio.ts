import { Twilio } from 'twilio';

// Get Twilio credentials from environment
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

// Create Twilio client (only when credentials are available)
const twilioClient =
  accountSid && authToken ? new Twilio(accountSid, authToken) : null;

/**
 * Send OTP verification code to a phone number
 * @param phoneNumber - Phone number in E.164 format (e.g., +819012345678)
 * @returns Verification SID if successful
 */
export async function sendOtp(phoneNumber: string): Promise<string> {
  // Development mode: log to console instead of sending SMS
  if (!twilioClient || !verifySid) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const log = console.info.bind(console);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('📱 SMS Verification Code for:', phoneNumber);
    log('Code:', code);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return 'dev-mode-verification';
  }

  // Production mode: send via Twilio Verify
  const verification = await twilioClient.verify.v2
    .services(verifySid)
    .verifications.create({
      to: phoneNumber,
      channel: 'sms',
    });

  return verification.sid;
}

/**
 * Verify OTP code for a phone number
 * @param phoneNumber - Phone number in E.164 format
 * @param code - 6-digit verification code
 * @returns true if verification successful, false otherwise
 */
export async function verifyOtp(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  // Development mode: accept any 6-digit code
  if (!twilioClient || !verifySid) {
    const log = console.info.bind(console);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('📱 Verifying code for:', phoneNumber);
    log('Code:', code);
    log('✅ Development mode: accepting code');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return code.length === 6 && /^\d+$/.test(code);
  }

  // Production mode: verify via Twilio Verify
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });

    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error('Twilio verification error:', error);
    return false;
  }
}
