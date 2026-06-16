"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Call } from "@twilio/voice-sdk";
import { useQueryClient } from "@tanstack/react-query";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { HandshakeVisualizer } from "./HandshakeVisualizer";
import { WaveformCanvas } from "./WaveformCanvas";
import { useApp } from "@/providers/AppProvider";
import { useHandshake } from "@/hooks/useHandshake";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { formatDuration, formatDisplayNumber, generateId, normalizePhoneNumber } from "@/lib/utils";

export function ActiveCallOverlay() {
  const { activeCall, endCall, updateActiveCall, setPendingDisposition } = useApp();
  const { settings } = useSettings();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const voice = useTwilioDevice();

  const [duration, setDuration] = useState(0);
  const [callError, setCallError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const voiceCallRef = useRef<Call | null>(null);
  const callStartedRef = useRef(false);

  const onHandshakeComplete = useCallback(() => {
    updateActiveCall({ handshakeComplete: true, isConnected: true, startTime: Date.now() });
  }, [updateActiveCall]);

  const { steps, isComplete, progress } = useHandshake(onHandshakeComplete);

  const placeTwilioCall = useCallback(async () => {
    if (!activeCall || callStartedRef.current) {
      return;
    }

    callStartedRef.current = true;
    setIsConnecting(true);
    setCallError(null);

    const to = normalizePhoneNumber(activeCall.number);
    const recordCall = settings?.recordCalls ?? true;

    try {
      if (settings?.routingProtocol !== "twilio") {
        updateActiveCall({ callSid: "cellular-simulated" });
        return;
      }

      if (settings?.voiceMode === "phone") {
        const agentPhone = profile?.agentPhone;
        if (!agentPhone) {
          setCallError("Add your phone number in Settings to use click-to-call");
          return;
        }

        const response = await fetch("/api/twilio/click-to-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentPhone: normalizePhoneNumber(agentPhone),
            customerPhone: to,
            from: settings.twilioFromNumber || undefined,
            sid: settings.twilioAccountSid || undefined,
            token: settings.twilioAuthToken || undefined,
            recordCall,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setCallError(data.error || "Click-to-call failed");
          return;
        }

        updateActiveCall({ callSid: data.callSid });
        return;
      }

      await voice.initDevice();
      const call = await voice.connect(to, recordCall);
      voiceCallRef.current = call;

      call.on("accept", () => {
        const sid = call.parameters.CallSid;
        updateActiveCall({ callSid: sid, isConnected: true, startTime: Date.now() });
      });

      call.on("disconnect", () => {
        voiceCallRef.current = null;
      });

      call.on("error", (err) => {
        setCallError(err.message);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Call failed";
      setCallError(message);
    } finally {
      setIsConnecting(false);
    }
  }, [activeCall, settings, profile, voice, updateActiveCall]);

  useEffect(() => {
    if (isComplete && !callStartedRef.current) {
      placeTwilioCall();
    }
  }, [isComplete, placeTwilioCall]);

  useEffect(() => {
    if (!activeCall?.startTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeCall.startTime!) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall?.startTime]);

  const handleEndCall = () => {
    voice.disconnect();

    if (activeCall) {
      const isTwilioCall = Boolean(activeCall.callSid && activeCall.callSid !== "cellular-simulated");
      const recordingEnabled = isTwilioCall && (settings?.recordCalls ?? true);

      setPendingDisposition({
        callLogId: generateId(),
        number: activeCall.number,
        name: activeCall.name,
        durationSeconds: duration,
        twilioCallSid: isTwilioCall ? activeCall.callSid ?? undefined : undefined,
        recordingStatus: recordingEnabled ? "processing" : "none",
        leadId: activeCall.leadId,
      });

      if (recordingEnabled) {
        [8000, 15000, 30000].forEach((delayMs) => {
          setTimeout(() => queryClient.invalidateQueries({ queryKey: ["callLogs"] }), delayMs);
        });
      }
    }

    endCall();
  };

  const handleMuteToggle = () => {
    const nextMuted = !activeCall?.isMuted;
    updateActiveCall({ isMuted: nextMuted });
    voice.setMuted(nextMuted);
  };

  if (!activeCall) {
    return null;
  }

  const displayDuration = activeCall.startTime ? formatDuration(duration) : "00:00";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cosmic-bg/95 backdrop-blur-sm">
      <div className="flex flex-1 flex-col p-6 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col items-center pt-8">
          <div className="flex size-20 items-center justify-center rounded-full bg-cosmic-violet/20 mb-4">
            <Shield className="size-10 text-cosmic-violet-light" />
          </div>
          <h2 className="text-xl font-semibold text-cosmic-text">{activeCall.name}</h2>
          <p className="text-cosmic-muted mt-1">{formatDisplayNumber(activeCall.number)}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {isConnecting ? (
              <Badge variant="violet">Connecting...</Badge>
            ) : activeCall.isConnected ? (
              <Badge variant="success">Live</Badge>
            ) : (
              <Badge variant="muted">Handshaking</Badge>
            )}
            {settings?.recordCalls && settings?.routingProtocol === "twilio" ? (
              <Badge variant="violet">Recording</Badge>
            ) : null}
            <span className="text-lg font-mono text-cosmic-text">{displayDuration}</span>
          </div>

          {callError ? (
            <div className="mt-4 rounded-xl border border-cosmic-red/30 bg-cosmic-red/10 px-4 py-2 text-sm text-cosmic-red">
              {callError}
            </div>
          ) : null}

          {voice.error && settings?.voiceMode === "browser" ? (
            <div className="mt-2 text-xs text-cosmic-muted">{voice.error}</div>
          ) : null}
        </div>

        <div className="mt-8 max-w-md mx-auto w-full">
          {!isComplete ? (
            <HandshakeVisualizer steps={steps} progress={progress} />
          ) : (
            <div className="rounded-2xl border border-cosmic-border/60 bg-cosmic-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-cosmic-text">Audio Scrambler</span>
                <Toggle
                  checked={activeCall.isScramblerOn}
                  onChange={(checked) => updateActiveCall({ isScramblerOn: checked })}
                />
              </div>
              <WaveformCanvas isActive={activeCall.isScramblerOn} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 p-6 border-t border-cosmic-border/60 bg-cosmic-surface">
        <Button variant="secondary" size="icon" onClick={handleMuteToggle} className="size-14">
          {activeCall.isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>

        <Button variant="danger" size="icon" onClick={handleEndCall} className="size-16">
          <PhoneOff className="size-6" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => updateActiveCall({ isSpeakerOn: !activeCall.isSpeakerOn })}
          className="size-14"
        >
          {activeCall.isSpeakerOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </Button>
      </div>
    </div>
  );
}
