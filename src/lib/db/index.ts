import { getSupabase } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import type { CallLogEntry, SecureContact, AppSettings } from "@/lib/types";

const defaultSettings: AppSettings = {
  routingProtocol: "twilio",
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioFromNumber: "",
  recordCalls: true,
  voiceMode: "browser",
};

function mapCallLog(row: Record<string, unknown>): CallLogEntry {
  return {
    id: row.id as string,
    number: row.number as string,
    name: row.name as string,
    timestamp: row.timestamp as string,
    durationSeconds: row.duration_seconds as number,
    isIncoming: row.is_incoming as boolean,
    isMissed: row.is_missed as boolean,
    isSecure: row.is_secure as boolean,
    twilioCallSid: (row.twilio_call_sid as string) || undefined,
    recordingSid: (row.recording_sid as string) || undefined,
    recordingStatus: (row.recording_status as CallLogEntry["recordingStatus"]) || "none",
    recordingDurationSeconds:
      row.recording_duration_seconds != null ? (row.recording_duration_seconds as number) : undefined,
    leadId: (row.lead_id as string) || undefined,
    disposition: (row.disposition as CallLogEntry["disposition"]) || undefined,
    notes: (row.notes as string) || undefined,
    userId: (row.user_id as string) || undefined,
  };
}

function mapContact(row: Record<string, unknown>): SecureContact {
  return {
    id: row.id as string,
    name: row.name as string,
    number: row.number as string,
    cryptoKey: row.crypto_key as string,
  };
}

function mapSettings(row: Record<string, unknown>): AppSettings {
  return {
    routingProtocol: row.routing_protocol as AppSettings["routingProtocol"],
    twilioAccountSid: row.twilio_account_sid as string,
    twilioAuthToken: row.twilio_auth_token as string,
    twilioFromNumber: row.twilio_from_number as string,
    recordCalls: (row.record_calls as boolean) ?? true,
    voiceMode: (row.voice_mode as AppSettings["voiceMode"]) || "browser",
  };
}

export async function getCallLogs(): Promise<CallLogEntry[]> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("call_logs")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCallLog);
}

export async function addCallLog(entry: CallLogEntry): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("call_logs").insert({
    id: entry.id,
    user_id: userId,
    number: entry.number,
    name: entry.name,
    timestamp: entry.timestamp,
    duration_seconds: entry.durationSeconds,
    is_incoming: entry.isIncoming,
    is_missed: entry.isMissed,
    is_secure: entry.isSecure,
    twilio_call_sid: entry.twilioCallSid ?? null,
    recording_status: entry.recordingStatus ?? (entry.twilioCallSid ? "processing" : "none"),
    recording_sid: entry.recordingSid ?? null,
    recording_duration_seconds: entry.recordingDurationSeconds ?? null,
    lead_id: entry.leadId ?? null,
    disposition: entry.disposition ?? null,
    notes: entry.notes ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCallLog(id: string): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("call_logs").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getContacts(): Promise<SecureContact[]> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapContact);
}

export async function addContact(contact: SecureContact): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("contacts").insert({
    id: contact.id,
    user_id: userId,
    name: contact.name,
    number: contact.number,
    crypto_key: contact.cryptoKey,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateContact(contact: SecureContact): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("contacts")
    .update({
      name: contact.name,
      number: contact.number,
      crypto_key: contact.cryptoKey,
    })
    .eq("id", contact.id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("contacts").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSettings(): Promise<AppSettings> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return defaultSettings;
  }

  return mapSettings(data);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("user_settings").upsert({
    user_id: userId,
    routing_protocol: settings.routingProtocol,
    twilio_account_sid: settings.twilioAccountSid,
    twilio_auth_token: settings.twilioAuthToken,
    twilio_from_number: settings.twilioFromNumber,
    record_calls: settings.recordCalls,
    voice_mode: settings.voiceMode,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
