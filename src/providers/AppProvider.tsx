"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ActiveCallState, PendingDisposition, ScreenId } from "@/lib/types";

interface AppContextValue {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  activeCall: ActiveCallState | null;
  startCall: (number: string, name: string, leadId?: string) => void;
  endCall: () => void;
  updateActiveCall: (updates: Partial<ActiveCallState>) => void;
  dialInput: string;
  setDialInput: (value: string) => void;
  pendingDisposition: PendingDisposition | null;
  setPendingDisposition: (pending: PendingDisposition | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("dial");
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [dialInput, setDialInput] = useState("");
  const [pendingDisposition, setPendingDisposition] = useState<PendingDisposition | null>(null);

  const startCall = useCallback((number: string, name: string, leadId?: string) => {
    setActiveCall({
      number,
      name,
      callSid: null,
      isConnected: false,
      isMuted: false,
      isSpeakerOn: false,
      isScramblerOn: true,
      startTime: null,
      handshakeComplete: false,
      leadId,
    });
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const updateActiveCall = useCallback((updates: Partial<ActiveCallState>) => {
    setActiveCall((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, ...updates };
    });
  }, []);

  const value = useMemo(
    () => ({
      activeScreen,
      setActiveScreen,
      activeCall,
      startCall,
      endCall,
      updateActiveCall,
      dialInput,
      setDialInput,
      pendingDisposition,
      setPendingDisposition,
    }),
    [activeScreen, activeCall, startCall, endCall, updateActiveCall, dialInput, pendingDisposition],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
