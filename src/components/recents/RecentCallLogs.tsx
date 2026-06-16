"use client";

import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RecordingPlayer } from "@/components/recents/RecordingPlayer";
import { useApp } from "@/providers/AppProvider";
import { useFilteredCallLogs } from "@/hooks/useCallLogs";
import { formatDuration, formatDisplayNumber, formatTimestamp } from "@/lib/utils";
import type { CallLogEntry } from "@/lib/types";
import { DISPOSITION_LABELS } from "@/lib/types";
import { useState } from "react";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "incoming", label: "Incoming" },
  { id: "outgoing", label: "Outgoing" },
];

function CallLogIcon({ log }: { log: CallLogEntry }) {
  if (log.isMissed) {
    return <PhoneMissed className="size-4 text-cosmic-red" />;
  }
  if (log.isIncoming) {
    return <PhoneIncoming className="size-4 text-cosmic-green" />;
  }
  return <PhoneOutgoing className="size-4 text-cosmic-violet-light" />;
}

function CallLogItem({
  log,
  onRedial,
}: {
  log: CallLogEntry;
  onRedial: (log: CallLogEntry) => void;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-cosmic-border/40 bg-cosmic-surface p-3 transition-all duration-200 hover:border-cosmic-violet/30 hover:bg-cosmic-surface-elevated">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-bg">
        <CallLogIcon log={log} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-cosmic-text truncate">{log.name}</span>
          {log.isSecure ? <Badge variant="success">E2EE</Badge> : <Badge variant="muted">VOIP</Badge>}
          {log.recordingStatus === "completed" ? <Badge variant="violet">Recorded</Badge> : null}
        </div>
        <div className="flex items-center gap-2 text-xs text-cosmic-muted mt-0.5">
          <span>{formatDisplayNumber(log.number)}</span>
          {log.durationSeconds > 0 ? <span>· {formatDuration(log.durationSeconds)}</span> : null}
          {log.recordingDurationSeconds ? (
            <span>· Rec {formatDuration(log.recordingDurationSeconds)}</span>
          ) : null}
        </div>
        {log.disposition ? (
          <p className="text-xs text-cosmic-violet-light mt-0.5">
            {DISPOSITION_LABELS[log.disposition]}
          </p>
        ) : null}
        <div className="mt-2">
          <RecordingPlayer log={log} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="text-xs text-cosmic-muted">{formatTimestamp(log.timestamp)}</div>
        <Button variant="ghost" size="sm" onClick={() => onRedial(log)} className="h-8 px-2">
          <Phone className="size-4 text-cosmic-green" />
          Redial
        </Button>
      </div>
    </div>
  );
}

export function RecentCallLogs() {
  const [filter, setFilter] = useState("all");
  const { callLogs, isLoading } = useFilteredCallLogs(filter as "all" | "missed" | "incoming" | "outgoing");
  const { setDialInput, setActiveScreen, startCall } = useApp();

  const handleRedial = (log: CallLogEntry) => {
    setDialInput(log.number);
    startCall(log.number, log.name);
  };

  return (
    <div className="flex h-full flex-col p-4 gap-4">
      <div>
        <h2 className="text-lg font-semibold text-cosmic-text">Recent Calls</h2>
        <p className="text-sm text-cosmic-muted">Play recordings or redial from history</p>
      </div>

      <Tabs tabs={FILTER_TABS} activeTab={filter} onTabChange={setFilter} />

      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-cosmic-surface animate-pulse" />
            ))}
          </div>
        ) : callLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Phone className="size-12 text-cosmic-muted/40 mb-4" />
            <p className="text-cosmic-muted">No call history yet</p>
            <button
              type="button"
              onClick={() => setActiveScreen("dial")}
              className="mt-4 text-sm text-cosmic-violet-light hover:underline"
            >
              Make your first call
            </button>
          </div>
        ) : (
          callLogs.map((log) => <CallLogItem key={log.id} log={log} onRedial={handleRedial} />)
        )}
      </div>
    </div>
  );
}
