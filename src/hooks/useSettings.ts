"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, saveSettings } from "@/lib/db";
import { useSupabase } from "@/providers/SupabaseProvider";

const SETTINGS_KEY = ["settings"] as const;

export function useSettings() {
  const queryClient = useQueryClient();
  const { isReady, user } = useSupabase();

  const query = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
    enabled: isReady && Boolean(user),
  });

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    saveSettings: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}
