import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getUserFromRequest } from "@/lib/auth/request-user";
import { getTwilioCredentials } from "@/lib/twilio/credentials";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountSid, apiKeySid, apiKeySecret, twimlAppSid } = getTwilioCredentials();

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      return NextResponse.json(
        {
          error:
            "Twilio Voice not configured. Set TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, and TWILIO_TWIML_APP_SID in .env",
        },
        { status: 400 },
      );
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false,
    });

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: user.id,
      ttl: 3600,
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Token generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
