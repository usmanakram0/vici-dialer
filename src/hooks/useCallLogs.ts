"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCallLogs, addCallLog, deleteCallLog } from "@/lib/db";
import { useSupabase } from "@/providers/SupabaseProvider";

const CALL_LOGS_KEY = ["callLogs"] as const;

export function useCallLogs() {
  const queryClient = useQueryClient();
  const { isReady, user } = useSupabase();

  const query = useQuery({
    queryKey: CALL_LOGS_KEY,
    queryFn: getCallLogs,
    enabled: isReady && Boolean(user),
  });

  const addMutation = useMutation({
    mutationFn: addCallLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALL_LOGS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCallLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALL_LOGS_KEY });
    },
  });

  return {
    callLogs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addCallLog: addMutation.mutate,
    deleteCallLog: deleteMutation.mutate,
  };
}

export function useFilteredCallLogs(filter: "all" | "missed" | "incoming" | "outgoing") {
  const { callLogs, ...rest } = useCallLogs();

  const filtered = callLogs.filter((log) => {
    if (filter === "missed") {
      return log.isMissed;
    }
    if (filter === "incoming") {
      return log.isIncoming;
    }
    if (filter === "outgoing") {
      return !log.isIncoming;
    }
    return true;
  });

  return { callLogs: filtered, ...rest };
}
