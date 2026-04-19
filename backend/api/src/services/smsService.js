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

export async function sendCredentialsSms(toPhone, payload) {
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  const client = getTwilioClient();
  const body =
    `MediLink account created.\n` +
    `Health ID: ${payload.ethiopianHealthId}\n` +
    `Username: ${payload.email}\n` +
    `Temp Password: ${payload.tempPassword}\n` +
    `Please login and change your password.`;

  if (!client || !fromPhone) {
    // eslint-disable-next-line no-console
    console.warn('[sms] Twilio not configured. Credentials SMS payload:', payload, 'to:', toPhone);
    return;
  }

  await client.messages.create({ to: toPhone, from: fromPhone, body });
}

