"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 rounded-xl bg-cosmic-bg p-1", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-cosmic-violet text-cosmic-violet-light shadow-sm"
                : "text-cosmic-muted hover:text-cosmic-text hover:bg-cosmic-surface-elevated/50",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
