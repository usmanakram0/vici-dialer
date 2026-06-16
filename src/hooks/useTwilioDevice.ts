"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { getSupabase } from "@/lib/supabase/client";

export function useTwilioDevice() {
  const deviceRef = useRef<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initDevice = useCallback(async () => {
    try {
      setError(null);
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Sign in required for browser calling");
      }

      const res = await fetch("/api/twilio/token", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize voice");
      }

      if (deviceRef.current) {
        deviceRef.current.destroy();
      }

      const device = new Device(data.token, { logLevel: 1 });
      await device.register();
      deviceRef.current = device;
      setIsReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Voice init failed";
      setError(message);
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, []);

  const connect = useCallback(async (to: string, recordCall: boolean): Promise<Call> => {
    if (!deviceRef.current) {
      await initDevice();
    }

    const device = deviceRef.current;
    if (!device) {
      throw new Error("Voice device not ready");
    }

    return device.connect({
      params: {
        To: to,
        RecordCall: recordCall ? "true" : "false",
      },
    });
  }, [initDevice]);

  const disconnect = useCallback(() => {
    deviceRef.current?.disconnectAll();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    const call = deviceRef.current?.calls[0];
    if (call) {
      call.mute(muted);
    }
  }, []);

  return {
    initDevice,
    connect,
    disconnect,
    setMuted,
    isReady,
    error,
  };
}
