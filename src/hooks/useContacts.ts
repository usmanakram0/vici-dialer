"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, addContact, updateContact, deleteContact } from "@/lib/db";
import type { SecureContact } from "@/lib/types";
import { useSupabase } from "@/providers/SupabaseProvider";

const CONTACTS_KEY = ["contacts"] as const;

export function useContacts() {
  const queryClient = useQueryClient();
  const { isReady, user } = useSupabase();

  const query = useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: getContacts,
    enabled: isReady && Boolean(user),
  });

  const addMutation = useMutation({
    mutationFn: addContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });

  const findByNumber = (number: string): SecureContact | undefined => {
    const normalized = number.replace(/\D/g, "");
    return query.data?.find((c) => {
      const contactDigits = c.number.replace(/\D/g, "");
      return contactDigits === normalized || contactDigits.endsWith(normalized) || normalized.endsWith(contactDigits);
    });
  };

  return {
    contacts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addContact: addMutation.mutate,
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    findByNumber,
  };
}
