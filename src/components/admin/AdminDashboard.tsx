"use client";

import { BarChart3, Phone, Users, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { DISPOSITION_LABELS } from "@/lib/types";

export function AdminDashboard() {
  const { stats, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="h-40 w-full max-w-lg rounded-2xl bg-cosmic-surface animate-pulse" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-cosmic-muted">
        Admin dashboard unavailable
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 gap-4 overflow-y-auto scrollbar-thin">
      <div>
        <h2 className="text-lg font-semibold text-cosmic-text">Team Dashboard</h2>
        <p className="text-sm text-cosmic-muted">Today&apos;s sales activity</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-cosmic-muted mb-2">
            <Phone className="size-4" />
            <span className="text-xs">Calls Today</span>
          </div>
          <p className="text-2xl font-semibold text-cosmic-text">{stats.callsToday}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-cosmic-muted mb-2">
            <Target className="size-4" />
            <span className="text-xs">New Leads</span>
          </div>
          <p className="text-2xl font-semibold text-cosmic-text">{stats.leadsNew}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-cosmic-muted mb-2">Interested</p>
          <p className="text-2xl font-semibold text-cosmic-green">{stats.leadsInterested}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-cosmic-muted mb-2">Callbacks</p>
          <p className="text-2xl font-semibold text-cosmic-violet-light">{stats.leadsCallback}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Calls by Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {stats.callsByAgent.length === 0 ? (
            <p className="text-sm text-cosmic-muted">No calls yet today</p>
          ) : (
            stats.callsByAgent.map((row) => (
              <div key={row.userId} className="flex justify-between text-sm">
                <span className="text-cosmic-text truncate">{row.email}</span>
                <span className="text-cosmic-muted">{row.count}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            Dispositions Today
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {stats.dispositions.length === 0 ? (
            <p className="text-sm text-cosmic-muted">No dispositions logged</p>
          ) : (
            stats.dispositions.map((row) => (
              <div key={row.disposition} className="flex justify-between text-sm">
                <span className="text-cosmic-text">
                  {DISPOSITION_LABELS[row.disposition as keyof typeof DISPOSITION_LABELS] || row.disposition}
                </span>
                <span className="text-cosmic-muted">{row.count}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
