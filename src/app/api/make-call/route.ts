import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getAppBaseUrl, getTwilioCredentials } from "@/lib/twilio/credentials";

export async function POST(req: NextRequest) {
  try {
    const { to, from, sid, token, recordCall } = await req.json();

    const { accountSid, authToken, fromNumber } = getTwilioCredentials({ sid, token, from });

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: "Twilio settings missing" }, { status: 400 });
    }

    if (!to) {
      return NextResponse.json({ error: "Destination number required" }, { status: 400 });
    }

    const client = twilio(accountSid, authToken);
    const shouldRecord = recordCall !== false;
    const callbackUrl = `${getAppBaseUrl()}/api/twilio/recording-callback`;

    const dialAttributes = shouldRecord
      ? `record="record-from-answer" recordingStatusCallback="${callbackUrl}" recordingStatusCallbackMethod="POST" recordingStatusCallbackEvent="completed"`
      : "";

    const twiml = `
      <Response>
        <Dial ${dialAttributes}>${to}</Dial>
      </Response>
    `;

    const call = await client.calls.create({
      twiml: twiml,
      to: to,
      from: fromNumber,
    });

    return NextResponse.json({ success: true, callSid: call.sid, recordingEnabled: shouldRecord });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Call failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
