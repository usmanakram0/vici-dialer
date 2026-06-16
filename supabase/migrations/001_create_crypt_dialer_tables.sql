-- Migration 001: Initial tables (device_id — superseded by 002_auth_user_id.sql)
-- Run 002 after this if using Supabase Auth
CREATE TABLE IF NOT EXISTS public.call_logs (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_incoming BOOLEAN NOT NULL DEFAULT FALSE,
  is_missed BOOLEAN NOT NULL DEFAULT FALSE,
  is_secure BOOLEAN NOT NULL DEFAULT FALSE,
  twilio_call_sid TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS call_logs_device_timestamp_idx ON public.call_logs (device_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  crypto_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contacts_device_name_idx ON public.contacts (device_id, name);

CREATE TABLE IF NOT EXISTS public.user_settings (
  device_id TEXT PRIMARY KEY,
  routing_protocol TEXT NOT NULL DEFAULT 'twilio' CHECK (routing_protocol IN ('cellular', 'twilio')),
  twilio_account_sid TEXT NOT NULL DEFAULT '',
  twilio_auth_token TEXT NOT NULL DEFAULT '',
  twilio_from_number TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon key (data scoped by device_id in app queries)
CREATE POLICY "anon_call_logs_all" ON public.call_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_contacts_all" ON public.contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_user_settings_all" ON public.user_settings FOR ALL TO anon USING (true) WITH CHECK (true);
