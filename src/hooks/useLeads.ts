"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeads, addLead, updateLead, deleteLead, importLeads } from "@/lib/db/leads";
import { useSupabase } from "@/providers/SupabaseProvider";

const LEADS_KEY = ["leads"] as const;

export function useLeads() {
  const queryClient = useQueryClient();
  const { isReady, user } = useSupabase();

  const query = useQuery({
    queryKey: LEADS_KEY,
    queryFn: getLeads,
    enabled: isReady && Boolean(user),
  });

  const addMutation = useMutation({
    mutationFn: addLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: updateLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });

  const importMutation = useMutation({
    mutationFn: importLeads,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });

  return {
    leads: query.data ?? [],
    isLoading: query.isLoading,
    addLead: addMutation.mutate,
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
    importLeads: importMutation.mutate,
  };
}
