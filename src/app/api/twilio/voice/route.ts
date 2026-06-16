import { NextRequest, NextResponse } from "next/server";
import { getTwilioCredentials, buildDialTwiml } from "@/lib/twilio/credentials";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const to = String(formData.get("To") || "");
    const recordCall = String(formData.get("RecordCall") || "true") === "true";

    const { fromNumber } = getTwilioCredentials();

    if (!to) {
      return new NextResponse("<Response><Say>Missing destination number.</Say></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    if (!fromNumber) {
      return new NextResponse("<Response><Say>Twilio from number not configured.</Say></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const twiml = buildDialTwiml(to, fromNumber, recordCall);

    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch {
    return new NextResponse("<Response><Say>Call setup failed.</Say></Response>", {
      headers: { "Content-Type": "text/xml" },
      status: 500,
    });
  }
}
