"use client";

import { Delete, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/providers/AppProvider";
import { useContacts } from "@/hooks/useContacts";
import { useSettings } from "@/hooks/useSettings";
import { formatDisplayNumber } from "@/lib/utils";

const DIAL_KEYS = [
  { digit: "1", sub: "" },
  { digit: "2", sub: "ABC" },
  { digit: "3", sub: "DEF" },
  { digit: "4", sub: "GHI" },
  { digit: "5", sub: "JKL" },
  { digit: "6", sub: "MNO" },
  { digit: "7", sub: "PQRS" },
  { digit: "8", sub: "TUV" },
  { digit: "9", sub: "WXYZ" },
  { digit: "*", sub: "" },
  { digit: "0", sub: "+" },
  { digit: "#", sub: "" },
];

export function DialScreen() {
  const { dialInput, setDialInput, startCall } = useApp();
  const { findByNumber } = useContacts();
  const { settings } = useSettings();

  const matchedContact = dialInput.length > 0 ? findByNumber(dialInput) : undefined;
  const displayName = matchedContact?.name ?? "";
  const canCall = dialInput.replace(/\D/g, "").length >= 10;

  const handleKeyPress = (digit: string) => {
    setDialInput(dialInput + digit);
  };

  const handleBackspace = () => {
    setDialInput(dialInput.slice(0, -1));
  };

  const handleClear = () => {
    setDialInput("");
  };

  const handleCall = () => {
    if (!canCall) {
      return;
    }
    const name = matchedContact?.name ?? formatDisplayNumber(dialInput);
    startCall(dialInput, name);
  };

  const routingLabel = settings?.routingProtocol === "twilio" ? "TWILIO VOIP" : "CELLULAR";

  return (
    <div className="flex h-full flex-col p-4">
      <Card className="mb-4 flex flex-col items-center py-6">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-cosmic-muted">
          {routingLabel}
        </div>
        <div className="text-3xl font-light tracking-wider text-cosmic-text min-h-[40px]">
          {dialInput.length > 0 ? formatDisplayNumber(dialInput) : "Enter number"}
        </div>
        {displayName ? (
          <div className="mt-2 text-sm font-medium text-cosmic-violet-light">{displayName}</div>
        ) : null}
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackspace} disabled={dialInput.length === 0}>
            <Delete className="size-4" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={dialInput.length === 0}>
            <X className="size-4" />
            Clear
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 flex-1 max-w-sm mx-auto w-full">
        {DIAL_KEYS.map((key) => (
          <button
            key={key.digit}
            type="button"
            onClick={() => handleKeyPress(key.digit)}
            className="flex flex-col items-center justify-center rounded-2xl border border-cosmic-border/40 bg-cosmic-surface-elevated/50 py-4 transition-all duration-200 hover:bg-cosmic-surface-elevated hover:border-cosmic-violet/30 active:scale-95"
          >
            <span className="text-2xl font-light text-cosmic-text">{key.digit}</span>
            {key.sub ? <span className="text-[10px] text-cosmic-muted tracking-widest">{key.sub}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-4 pb-2">
        <Button
          variant="success"
          size="lg"
          onClick={handleCall}
          disabled={!canCall}
          className="size-16 rounded-full animate-pulse-glow"
        >
          <Phone className="size-6" />
        </Button>
      </div>
    </div>
  );
}
