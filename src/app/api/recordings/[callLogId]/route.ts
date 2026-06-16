import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTwilioCredentials } from "@/lib/twilio/credentials";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ callLogId: string }> },
) {
  try {
    const { callLogId } = await context.params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callLog, error: logError } = await supabase
      .from("call_logs")
      .select("recording_sid, recording_status")
      .eq("id", callLogId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    if (!callLog?.recording_sid || callLog.recording_status !== "completed") {
      return NextResponse.json({ error: "Recording not available" }, { status: 404 });
    }

    const { accountSid, authToken } = getTwilioCredentials();
    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "Twilio not configured" }, { status: 500 });
    }

    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${callLog.recording_sid}.mp3`;
    const audioResponse = await fetch(recordingUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
    });

    if (!audioResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch recording" }, { status: 502 });
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Playback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
