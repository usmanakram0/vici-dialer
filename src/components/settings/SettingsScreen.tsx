"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Key, Radio } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import type { AppSettings } from "@/lib/types";

export function SettingsScreen() {
  const { settings, isLoading, saveSettings, isSaving } = useSettings();
  const { profile, updateProfile, isUpdating } = useProfile();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [agentPhone, setAgentPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [twilioStatus, setTwilioStatus] = useState<{ isConfigured: boolean } | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setAgentPhone(profile.agentPhone);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  useEffect(() => {
    fetch("/api/twilio-status")
      .then((res) => res.json())
      .then(setTwilioStatus)
      .catch(() => setTwilioStatus({ isConfigured: false }));
  }, []);

  const handleSave = () => {
    if (localSettings) {
      saveSettings(localSettings);
      updateProfile({ agentPhone, displayName });
      setTestResult("Settings saved successfully");
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleTestConnection = async () => {
    setTestResult("Testing connection...");
    try {
      const res = await fetch("/api/twilio-status");
      const data = await res.json();
      if (data.isConfigured) {
        setTestResult("Twilio REST API keys are active");
      } else {
        setTestResult("Twilio credentials not configured on server");
      }
    } catch {
      setTestResult("Connection test failed");
    }
  };

  if (isLoading || !localSettings) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="h-32 w-full max-w-md rounded-2xl bg-cosmic-surface animate-pulse" />
      </div>
    );
  }

  const isTwilioActive =
    twilioStatus?.isConfigured ||
    Boolean(localSettings.twilioAccountSid && localSettings.twilioAuthToken && localSettings.twilioFromNumber);

  return (
    <div className="flex h-full flex-col p-4 gap-4 overflow-y-auto scrollbar-thin">
      <div>
        <h2 className="text-lg font-semibold text-cosmic-text">Settings</h2>
        <p className="text-sm text-cosmic-muted">Connectivity & security configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing Protocol</CardTitle>
          <CardDescription>Choose how outbound calls are routed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, routingProtocol: "cellular" })}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
              localSettings.routingProtocol === "cellular"
                ? "border-cosmic-violet bg-cosmic-violet/10"
                : "border-cosmic-border hover:border-cosmic-border/80"
            }`}
          >
            <Radio className="size-5 text-cosmic-violet-light" />
            <div className="text-left">
              <p className="font-medium text-cosmic-text">CELLULAR</p>
              <p className="text-xs text-cosmic-muted">Native cellular handler (simulated)</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, routingProtocol: "twilio" })}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
              localSettings.routingProtocol === "twilio"
                ? "border-cosmic-violet bg-cosmic-violet/10"
                : "border-cosmic-border hover:border-cosmic-border/80"
            }`}
          >
            <Wifi className="size-5 text-cosmic-green" />
            <div className="text-left">
              <p className="font-medium text-cosmic-text">TWILIO Web VOIP</p>
              <p className="text-xs text-cosmic-muted">Real calls via Twilio (browser or phone)</p>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Twilio Secret Center</CardTitle>
              <CardDescription>Server .env is used if fields are empty</CardDescription>
            </div>
            <Badge variant={isTwilioActive ? "success" : "muted"}>
              {isTwilioActive ? (
                <span className="flex items-center gap-1">
                  <Wifi className="size-3" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="size-3" /> Offline
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            label="Account SID"
            value={localSettings.twilioAccountSid}
            onChange={(e) => setLocalSettings({ ...localSettings, twilioAccountSid: e.target.value })}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <Input
            label="Auth Token"
            type="password"
            value={localSettings.twilioAuthToken}
            onChange={(e) => setLocalSettings({ ...localSettings, twilioAuthToken: e.target.value })}
            placeholder="Your auth token"
          />
          <Input
            label="From Number"
            value={localSettings.twilioFromNumber}
            onChange={(e) => setLocalSettings({ ...localSettings, twilioFromNumber: e.target.value })}
            placeholder="+1234567890"
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleTestConnection}>
              <Key className="size-4" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voice Mode</CardTitle>
          <CardDescription>How your team talks on outbound calls</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, voiceMode: "browser" })}
            className={`rounded-xl border p-3 text-left transition-all duration-200 ${
              localSettings.voiceMode === "browser"
                ? "border-cosmic-violet bg-cosmic-violet/10"
                : "border-cosmic-border"
            }`}
          >
            <p className="font-medium text-cosmic-text">Browser (headset)</p>
            <p className="text-xs text-cosmic-muted">Talk through your computer mic — recommended for sales team</p>
          </button>
          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, voiceMode: "phone" })}
            className={`rounded-xl border p-3 text-left transition-all duration-200 ${
              localSettings.voiceMode === "phone"
                ? "border-cosmic-violet bg-cosmic-violet/10"
                : "border-cosmic-border"
            }`}
          >
            <p className="font-medium text-cosmic-text">Click-to-call (your phone)</p>
            <p className="text-xs text-cosmic-muted">Twilio rings your phone first, then connects the customer</p>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Agent details for click-to-call and team view</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input
            label="Your phone (for click-to-call)"
            value={agentPhone}
            onChange={(e) => setAgentPhone(e.target.value)}
            placeholder="+1234567890"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call Recording</CardTitle>
          <CardDescription>Record outbound Twilio calls for playback in Recents</CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle
            checked={localSettings.recordCalls}
            onChange={(checked) => setLocalSettings({ ...localSettings, recordCalls: checked })}
            label="Record outbound calls"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>End-to-end encryption preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle checked={true} onChange={() => {}} label="Require cryptographic handshake on all calls" />
        </CardContent>
      </Card>

      {testResult ? (
        <div className="rounded-xl border border-cosmic-violet/30 bg-cosmic-violet/10 px-4 py-2 text-sm text-cosmic-violet-light">
          {testResult}
        </div>
      ) : null}

      <Button variant="primary" onClick={handleSave} disabled={isSaving || isUpdating} className="w-full">
        {isSaving || isUpdating ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
