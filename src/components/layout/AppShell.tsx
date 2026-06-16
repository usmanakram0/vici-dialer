"use client";

import { Shield, LogOut } from "lucide-react";
import { NavBar } from "./NavBar";
import { DialScreen } from "@/components/dial/DialScreen";
import { RecentCallLogs } from "@/components/recents/RecentCallLogs";
import { LeadsScreen } from "@/components/leads/LeadsScreen";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { ActiveCallOverlay } from "@/components/call/ActiveCallOverlay";
import { DispositionModal } from "@/components/call/DispositionModal";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useApp } from "@/providers/AppProvider";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useProfile } from "@/hooks/useProfile";

export function AppShell() {
  const { activeScreen, setActiveScreen, activeCall } = useApp();
  const { isReady, user, signOut } = useSupabase();
  const { profile, isAdmin } = useProfile();

  if (!isReady) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-cosmic-bg gap-4">
        <div className="size-12 rounded-full bg-cosmic-violet/20 animate-pulse" />
        <p className="text-sm text-cosmic-muted">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-cosmic-bg">
      <header className="flex items-center justify-between border-b border-cosmic-border/60 bg-cosmic-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-cosmic-violet/20">
            <Shield className="size-4 text-cosmic-violet-light" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-cosmic-text">Crypt Dialer</h1>
            <p className="text-xs text-cosmic-muted truncate max-w-[160px]">
              {profile?.displayName || user.email}
              {isAdmin ? " · Admin" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-cosmic-green/10 px-3 py-1">
            <span className="size-2 rounded-full bg-cosmic-green animate-pulse-glow" />
            <span className="text-xs font-medium text-cosmic-green">Sales Ready</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex size-8 items-center justify-center rounded-lg text-cosmic-muted hover:bg-cosmic-surface-elevated hover:text-cosmic-text transition-colors duration-200 active:scale-95"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeScreen === "dial" ? <DialScreen /> : null}
        {activeScreen === "leads" ? <LeadsScreen /> : null}
        {activeScreen === "recents" ? <RecentCallLogs /> : null}
        {activeScreen === "admin" && isAdmin ? <AdminDashboard /> : null}
        {activeScreen === "settings" ? <SettingsScreen /> : null}
      </main>

      <NavBar activeScreen={activeScreen} onNavigate={setActiveScreen} showAdmin={isAdmin} />

      {activeCall ? <ActiveCallOverlay /> : null}
      <DispositionModal />
    </div>
  );
}
