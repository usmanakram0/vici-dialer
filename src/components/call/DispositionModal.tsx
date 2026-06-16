"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/providers/AppProvider";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useLeads } from "@/hooks/useLeads";
import type { CallDisposition, CallLogEntry, LeadStatus } from "@/lib/types";
import { DISPOSITION_LABELS } from "@/lib/types";

const DISPOSITIONS: CallDisposition[] = [
  "connected",
  "interested",
  "callback",
  "not_interested",
  "no_answer",
  "voicemail",
  "wrong_number",
  "do_not_call",
];

function mapDispositionToLeadStatus(disposition: CallDisposition): string | null {
  if (disposition === "interested") return "interested";
  if (disposition === "callback") return "callback";
  if (disposition === "not_interested") return "not_interested";
  if (disposition === "do_not_call") return "do_not_call";
  if (disposition === "connected") return "contacted";
  return null;
}

export function DispositionModal() {
  const { pendingDisposition, setPendingDisposition } = useApp();
  const { addCallLog } = useCallLogs();
  const { leads, updateLead } = useLeads();
  const [disposition, setDisposition] = useState<CallDisposition>("connected");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!pendingDisposition) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);

    const log: CallLogEntry = {
      id: pendingDisposition.callLogId,
      number: pendingDisposition.number,
      name: pendingDisposition.name,
      timestamp: new Date().toISOString(),
      durationSeconds: pendingDisposition.durationSeconds,
      isIncoming: false,
      isMissed: disposition === "no_answer",
      isSecure: true,
      twilioCallSid: pendingDisposition.twilioCallSid,
      recordingStatus: pendingDisposition.recordingStatus,
      leadId: pendingDisposition.leadId,
      disposition,
      notes: notes.trim(),
    };

    addCallLog(log);

    if (pendingDisposition.leadId) {
      const lead = leads.find((l) => l.id === pendingDisposition.leadId);
      if (lead) {
        const newStatus = mapDispositionToLeadStatus(disposition);
        updateLead({
          ...lead,
          status: (newStatus as LeadStatus) || lead.status,
          lastContactedAt: new Date().toISOString(),
          notes: notes.trim() || lead.notes,
        });
      }
    }

    setPendingDisposition(null);
    setNotes("");
    setDisposition("connected");
    setIsSaving(false);
  };

  const handleSkip = () => {
    const log: CallLogEntry = {
      id: pendingDisposition.callLogId,
      number: pendingDisposition.number,
      name: pendingDisposition.name,
      timestamp: new Date().toISOString(),
      durationSeconds: pendingDisposition.durationSeconds,
      isIncoming: false,
      isMissed: false,
      isSecure: true,
      twilioCallSid: pendingDisposition.twilioCallSid,
      recordingStatus: pendingDisposition.recordingStatus,
      leadId: pendingDisposition.leadId,
    };
    addCallLog(log);
    setPendingDisposition(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <h3 className="text-lg font-semibold text-cosmic-text mb-1">Call outcome</h3>
        <p className="text-sm text-cosmic-muted mb-4">
          {pendingDisposition.name} · {pendingDisposition.durationSeconds}s
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {DISPOSITIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDisposition(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors duration-200 ${
                disposition === item
                  ? "border-cosmic-violet bg-cosmic-violet/20 text-cosmic-violet-light"
                  : "border-cosmic-border text-cosmic-muted hover:border-cosmic-violet/40"
              }`}
            >
              {DISPOSITION_LABELS[item]}
            </button>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Call notes (optional)"
          rows={3}
          className="w-full rounded-xl border border-cosmic-border bg-cosmic-bg px-3 py-2 text-sm text-cosmic-text placeholder:text-cosmic-muted/60 outline-none focus:border-cosmic-violet mb-4"
        />

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={handleSkip} disabled={isSaving}>
            Skip
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save & Close"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
