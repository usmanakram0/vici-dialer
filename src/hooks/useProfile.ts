"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureProfile, getProfile, updateProfile, getTeamProfiles } from "@/lib/db/profiles";
import { useSupabase } from "@/providers/SupabaseProvider";

const PROFILE_KEY = ["profile"] as const;
const TEAM_KEY = ["teamProfiles"] as const;

export function useProfile() {
  const queryClient = useQueryClient();
  const { isReady, user } = useSupabase();

  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      if (!user?.email) {
        return null;
      }
      const profile = await getProfile();
      if (profile) {
        return profile;
      }
      return ensureProfile(user.email);
    },
    enabled: isReady && Boolean(user),
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isAdmin: query.data?.role === "admin",
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useTeamProfiles() {
  const { isReady, user } = useSupabase();

  const query = useQuery({
    queryKey: TEAM_KEY,
    queryFn: getTeamProfiles,
    enabled: isReady && Boolean(user),
  });

  return { team: query.data ?? [], isLoading: query.isLoading };
}
