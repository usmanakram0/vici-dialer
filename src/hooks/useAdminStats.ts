"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useProfile } from "@/hooks/useProfile";
import type { AdminStats } from "@/lib/types";

export function useAdminStats() {
  const { isReady, user } = useSupabase();
  const { isAdmin } = useProfile();

  const query = useQuery({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<AdminStats> => {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to load admin stats");
      }

      return res.json();
    },
    enabled: isReady && Boolean(user) && isAdmin,
  });

  return { stats: query.data, isLoading: query.isLoading, isError: query.isError };
}
