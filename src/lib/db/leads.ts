import { getSupabase } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import type { Lead, LeadStatus } from "@/lib/types";

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    assignedTo: (row.assigned_to as string) || null,
    createdBy: row.created_by as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) || "",
    company: (row.company as string) || "",
    notes: (row.notes as string) || "",
    status: row.status as LeadStatus,
    source: row.source as string,
    lastContactedAt: (row.last_contacted_at as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.from("leads").select("*").order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapLead);
}

export async function addLead(lead: Lead): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("leads").insert({
    id: lead.id,
    assigned_to: lead.assignedTo,
    created_by: userId,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    company: lead.company || null,
    notes: lead.notes || null,
    status: lead.status,
    source: lead.source,
    last_contacted_at: lead.lastContactedAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateLead(lead: Lead): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("leads")
    .update({
      assigned_to: lead.assignedTo,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || null,
      company: lead.company || null,
      notes: lead.notes || null,
      status: lead.status,
      last_contacted_at: lead.lastContactedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function importLeads(leads: Lead[]): Promise<void> {
  const supabase = getSupabase();
  const userId = await getAuthenticatedUserId();

  const rows = leads.map((lead) => ({
    id: lead.id,
    assigned_to: lead.assignedTo,
    created_by: userId,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    company: lead.company || null,
    notes: lead.notes || null,
    status: lead.status,
    source: lead.source,
  }));

  const { error } = await supabase.from("leads").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}
