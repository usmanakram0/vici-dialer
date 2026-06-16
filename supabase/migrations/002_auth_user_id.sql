-- Migration 002: Switch from device_id to Supabase Auth (user_id + RLS)
-- Run in: https://supabase.com/dashboard/project/ixmzrhqmicrnbmhrltxa/sql
-- Prerequisite: 001_create_crypt_dialer_tables.sql must already be applied

-- Remove permissive anon policies from migration 001
DROP POLICY IF EXISTS "anon_call_logs_all" ON public.call_logs;
DROP POLICY IF EXISTS "anon_contacts_all" ON public.contacts;
DROP POLICY IF EXISTS "anon_user_settings_all" ON public.user_settings;

-- Clear device_id-era rows (no user mapping)
TRUNCATE public.call_logs, public.contacts, public.user_settings;

-- call_logs: device_id -> user_id
DROP INDEX IF EXISTS call_logs_device_timestamp_idx;
ALTER TABLE public.call_logs DROP COLUMN IF EXISTS device_id;
ALTER TABLE public.call_logs ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX call_logs_user_timestamp_idx ON public.call_logs (user_id, timestamp DESC);

-- contacts: device_id -> user_id
DROP INDEX IF EXISTS contacts_device_name_idx;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS device_id;
ALTER TABLE public.contacts ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX contacts_user_name_idx ON public.contacts (user_id, name);

-- user_settings: device_id PK -> user_id PK
DROP TABLE public.user_settings;
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  routing_protocol TEXT NOT NULL DEFAULT 'twilio' CHECK (routing_protocol IN ('cellular', 'twilio')),
  twilio_account_sid TEXT NOT NULL DEFAULT '',
  twilio_auth_token TEXT NOT NULL DEFAULT '',
  twilio_from_number TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users access only their own rows
CREATE POLICY "call_logs_select_own" ON public.call_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "call_logs_insert_own" ON public.call_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "call_logs_delete_own" ON public.call_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "contacts_select_own" ON public.contacts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "contacts_insert_own" ON public.contacts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_update_own" ON public.contacts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_delete_own" ON public.contacts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
