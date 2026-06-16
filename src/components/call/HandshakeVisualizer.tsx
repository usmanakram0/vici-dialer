"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HandshakeStep } from "@/lib/types";

interface HandshakeVisualizerProps {
  steps: HandshakeStep[];
  progress: number;
}

export function HandshakeVisualizer({ steps, progress }: HandshakeVisualizerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-cosmic-muted">
          <span>Cryptographic Handshake</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-cosmic-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-cosmic-violet transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300",
              step.status === "complete"
                ? "border-cosmic-green/30 bg-cosmic-green/5"
                : step.status === "active"
                  ? "border-cosmic-violet/50 bg-cosmic-violet/10"
                  : "border-cosmic-border/30 bg-cosmic-bg/50",
            )}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                step.status === "complete"
                  ? "bg-cosmic-green/20 text-cosmic-green"
                  : step.status === "active"
                    ? "bg-cosmic-violet/20 text-cosmic-violet-light"
                    : "bg-cosmic-border/20 text-cosmic-muted",
              )}
            >
              {step.status === "complete" ? (
                <Check className="size-3.5" />
              ) : step.status === "active" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span className="text-xs">{step.id}</span>
              )}
            </div>
            <span
              className={cn(
                "text-xs",
                step.status === "complete" ? "text-cosmic-green" : step.status === "active" ? "text-cosmic-violet-light" : "text-cosmic-muted",
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
