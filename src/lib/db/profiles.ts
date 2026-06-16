import { getSupabase } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import type { Profile, UserRole } from "@/lib/types";

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    userId: row.user_id as string,
    email: row.email as string,
    displayName: (row.display_name as string) || "",
    role: row.role as UserRole,
    agentPhone: (row.agent_phone as string) || "",
  };
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfile(data) : null;
}

export async function ensureProfile(email: string): Promise<Profile> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const existing = await getProfile();
  if (existing) {
    return existing;
  }

  const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const role: UserRole = count === 0 ? "admin" : "agent";

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      email,
      display_name: email.split("@")[0],
      role,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: updates.displayName,
      agent_phone: updates.agentPhone,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}

export async function getTeamProfiles(): Promise<Profile[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.from("profiles").select("*").order("email");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProfile);
}
