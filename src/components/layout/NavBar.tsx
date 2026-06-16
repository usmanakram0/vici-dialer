"use client";

import { Grid3x3, Clock, Users, Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenId } from "@/lib/types";

const BASE_NAV: Array<{ id: ScreenId; label: string; icon: typeof Grid3x3 }> = [
  { id: "dial", label: "Dial", icon: Grid3x3 },
  { id: "leads", label: "Leads", icon: Users },
  { id: "recents", label: "Recents", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

interface NavBarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  showAdmin: boolean;
}

export function NavBar({ activeScreen, onNavigate, showAdmin }: NavBarProps) {
  const items = showAdmin
    ? [...BASE_NAV.slice(0, 3), { id: "admin" as ScreenId, label: "Team", icon: BarChart3 }, BASE_NAV[3]]
    : BASE_NAV;

  return (
    <nav className="flex items-center justify-around border-t border-cosmic-border/60 bg-cosmic-surface px-1 py-2">
      {items.map((item) => {
        const isActive = activeScreen === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 min-w-0",
              isActive ? "text-cosmic-violet-light" : "text-cosmic-muted hover:text-cosmic-text",
            )}
          >
            <Icon className={cn("size-5", isActive && "scale-110")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
