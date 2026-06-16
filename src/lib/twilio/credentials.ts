export function getTwilioCredentials(body?: {
  sid?: string;
  token?: string;
  from?: string;
}) {
  return {
    accountSid: body?.sid || process.env.TWILIO_ACCOUNT_SID || "",
    authToken: body?.token || process.env.TWILIO_AUTH_TOKEN || "",
    fromNumber: body?.from || process.env.TWILIO_FROM_NUMBER || "",
    apiKeySid: process.env.TWILIO_API_KEY_SID || "",
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET || "",
    twimlAppSid: process.env.TWILIO_TWIML_APP_SID || "",
  };
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function buildDialTwiml(to: string, fromNumber: string, recordCall: boolean): string {
  const callbackUrl = `${getAppBaseUrl()}/api/twilio/recording-callback`;
  const recordAttrs = recordCall
    ? `record="record-from-answer" recordingStatusCallback="${callbackUrl}" recordingStatusCallbackMethod="POST" recordingStatusCallbackEvent="completed"`
    : "";

  return `
    <Response>
      <Dial callerId="${fromNumber}" ${recordAttrs}>${to}</Dial>
    </Response>
  `;
}
