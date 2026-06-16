import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/providers/AppProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

export const metadata: Metadata = {
  title: "Crypt Dialer — Secure VOIP Bridge",
  description: "Secure Crypt-style dialer with Twilio VOIP and E2EE handshake simulation",
};

export default function Home() {
  return (
    <QueryProvider>
      <SupabaseProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </SupabaseProvider>
    </QueryProvider>
  );
}