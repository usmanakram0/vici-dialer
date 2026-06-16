import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAppBaseUrl, getTwilioCredentials } from "@/lib/twilio/credentials";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    const { authToken } = getTwilioCredentials();
    const signature = req.headers.get("x-twilio-signature") || "";

    if (authToken) {
      const url = `${getAppBaseUrl()}/api/twilio/recording-callback`;
      const isValid = twilio.validateRequest(authToken, signature, url, params);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
      }
    }

    const callSid = params.CallSid;
    const recordingSid = params.RecordingSid;
    const recordingStatus = params.RecordingStatus;
    const recordingDuration = params.RecordingDuration;

    if (!callSid) {
      return NextResponse.json({ error: "Missing CallSid" }, { status: 400 });
    }

    if (recordingStatus === "completed" && recordingSid) {
      const admin = getSupabaseAdmin();
      const duration = recordingDuration ? parseInt(recordingDuration, 10) : null;

      const { error } = await admin
        .from("call_logs")
        .update({
          recording_sid: recordingSid,
          recording_status: "completed",
          recording_duration_seconds: duration,
        })
        .eq("twilio_call_sid", callSid);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (recordingStatus === "failed") {
      const admin = getSupabaseAdmin();
      await admin.from("call_logs").update({ recording_status: "failed" }).eq("twilio_call_sid", callSid);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Recording callback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
