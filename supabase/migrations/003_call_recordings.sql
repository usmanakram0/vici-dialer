-- Migration 003: Call recording fields
-- Run in: https://supabase.com/dashboard/project/ixmzrhqmicrnbmhrltxa/sql

ALTER TABLE public.call_logs
  ADD COLUMN IF NOT EXISTS recording_sid TEXT,
  ADD COLUMN IF NOT EXISTS recording_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS recording_duration_seconds INTEGER;

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS record_calls BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS call_logs_twilio_call_sid_idx ON public.call_logs (twilio_call_sid);
