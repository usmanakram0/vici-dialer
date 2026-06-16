import { NextResponse } from "next/server";

export async function GET() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  const isConfigured = Boolean(sid && token && from);

  return NextResponse.json({
    isConfigured,
    hasSid: Boolean(sid),
    hasToken: Boolean(token),
    hasFrom: Boolean(from),
  });
}
