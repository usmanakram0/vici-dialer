"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("flex items-center gap-3", className)}
    >
      {label ? <span className="text-sm text-cosmic-text">{label}</span> : null}
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
          checked ? "bg-cosmic-green border-cosmic-green" : "bg-cosmic-border border-cosmic-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
