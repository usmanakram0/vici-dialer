-- Migration 004: Sales team features (profiles, leads, dispositions)
-- Run in: https://supabase.com/dashboard/project/ixmzrhqmicrnbmhrltxa/sql

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  agent_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'interested', 'callback', 'not_interested', 'converted', 'do_not_call')
  ),
  source TEXT NOT NULL DEFAULT 'manual',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_assigned_idx ON public.leads (assigned_to);
CREATE INDEX IF NOT EXISTS leads_phone_idx ON public.leads (phone);

ALTER TABLE public.call_logs
  ADD COLUMN IF NOT EXISTS lead_id TEXT,
  ADD COLUMN IF NOT EXISTS disposition TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS voice_mode TEXT NOT NULL DEFAULT 'browser';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- leads policies (shared team pool)
CREATE POLICY "leads_select_all" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "leads_insert_all" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "leads_update_all" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "leads_delete_all" ON public.leads FOR DELETE TO authenticated USING (true);

-- call_logs: agents see own, admins see all
CREATE POLICY "call_logs_select_admin" ON public.call_logs FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Drop old select policy if exists and recreate - migration 002 had call_logs_select_own
DROP POLICY IF EXISTS "call_logs_select_own" ON public.call_logs;
