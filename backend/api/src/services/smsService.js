import twilio from 'twilio';

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendOtpSms(toPhone, otp) {
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  const client = getTwilioClient();
  const body = `Your MediLink verification code is: ${otp}`;

  if (!client || !fromPhone) {
    // Dev fallback: don't fail login flows if Twilio isn't configured
    // eslint-disable-next-line no-console
    console.warn('[sms] Twilio not configured. OTP:', otp, 'to:', toPhone);
    return;
  }

  await client.messages.create({ to: toPhone, from: fromPhone, body });
}

