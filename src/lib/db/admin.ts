import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminStats } from "@/lib/types";

export async function getAdminStats(): Promise<AdminStats> {
  const admin = getSupabaseAdmin();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: callsToday } = await admin
    .from("call_logs")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", todayStart.toISOString());

  const { data: leads } = await admin.from("leads").select("status");

  const { data: calls } = await admin
    .from("call_logs")
    .select("user_id, disposition")
    .gte("timestamp", todayStart.toISOString());

  const { data: profiles } = await admin.from("profiles").select("user_id, email");

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id as string, p.email as string]));

  const agentCounts = new Map<string, number>();
  (calls ?? []).forEach((call) => {
    const uid = call.user_id as string;
    agentCounts.set(uid, (agentCounts.get(uid) || 0) + 1);
  });

  const dispositionCounts = new Map<string, number>();
  (calls ?? []).forEach((call) => {
    const d = (call.disposition as string) || "unknown";
    dispositionCounts.set(d, (dispositionCounts.get(d) || 0) + 1);
  });

  const leadCounts = { new: 0, interested: 0, callback: 0 };
  (leads ?? []).forEach((lead) => {
    const status = lead.status as string;
    if (status === "new") leadCounts.new++;
    if (status === "interested") leadCounts.interested++;
    if (status === "callback") leadCounts.callback++;
  });

  return {
    callsToday: callsToday ?? 0,
    leadsNew: leadCounts.new,
    leadsInterested: leadCounts.interested,
    leadsCallback: leadCounts.callback,
    callsByAgent: Array.from(agentCounts.entries()).map(([userId, count]) => ({
      userId,
      email: profileMap.get(userId) || userId,
      count,
    })),
    dispositions: Array.from(dispositionCounts.entries()).map(([disposition, count]) => ({
      disposition,
      count,
    })),
  };
}
