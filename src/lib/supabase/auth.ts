import { getSupabase } from "./client";

export async function getAuthenticatedUserId(): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("Not authenticated. Please sign in.");
  }

  return data.user.id;
}
