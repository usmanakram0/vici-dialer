import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getTwilioCredentials, buildDialTwiml } from "@/lib/twilio/credentials";

export async function POST(req: NextRequest) {
  try {
    const { agentPhone, customerPhone, sid, token, from, recordCall } = await req.json();

    const { accountSid, authToken, fromNumber } = getTwilioCredentials({ sid, token, from });

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: "Twilio settings missing" }, { status: 400 });
    }

    if (!agentPhone || !customerPhone) {
      return NextResponse.json({ error: "Agent and customer numbers required" }, { status: 400 });
    }

    const client = twilio(accountSid, authToken);
    const shouldRecord = recordCall !== false;
    const twiml = buildDialTwiml(customerPhone, fromNumber, shouldRecord);

    const call = await client.calls.create({
      twiml: twiml,
      to: agentPhone,
      from: fromNumber,
    });

    return NextResponse.json({ success: true, callSid: call.sid, recordingEnabled: shouldRecord });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Click-to-call failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
