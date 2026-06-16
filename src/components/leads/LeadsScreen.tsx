"use client";

import { useState, useRef } from "react";
import { Phone, Plus, Upload, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useLeads } from "@/hooks/useLeads";
import { useTeamProfiles } from "@/hooks/useProfile";
import { useApp } from "@/providers/AppProvider";
import { generateId, formatDisplayNumber } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { LEAD_STATUS_LABELS } from "@/lib/types";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "interested", label: "Interested" },
  { id: "callback", label: "Callback" },
];

export function LeadsScreen() {
  const { leads, isLoading, addLead, updateLead, importLeads } = useLeads();
  const { team } = useTeamProfiles();
  const { startCall } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = leads.filter((lead) => {
    const matchesFilter = filter === "all" || lead.status === filter;
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCall = (lead: Lead) => {
    startCall(lead.phone, lead.name, lead.id);
  };

  const handleAdd = () => {
    if (!formName.trim() || !formPhone.trim()) {
      return;
    }

    addLead({
      id: generateId(),
      assignedTo: null,
      createdBy: "",
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      company: formCompany.trim(),
      notes: "",
      status: "new",
      source: "manual",
      lastContactedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setShowAdd(false);
    setFormName("");
    setFormPhone("");
    setFormCompany("");
    setFormEmail("");
  };

  const handleCsvImport = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const imported: Lead[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes("name")) {
        return;
      }

      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      const name = parts[0] || "Unknown";
      const phone = parts[1] || parts[0];
      if (!phone || phone === name && parts.length < 2) {
        return;
      }

      imported.push({
        id: generateId(),
        assignedTo: null,
        createdBy: "",
        name: parts.length >= 2 ? name : "Lead",
        phone: parts.length >= 2 ? phone : name,
        email: parts[2] || "",
        company: parts[3] || "",
        notes: "",
        status: "new",
        source: "csv",
        lastContactedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    if (imported.length > 0) {
      importLeads(imported);
    }
  };

  const assignLead = (lead: Lead, userId: string) => {
    updateLead({ ...lead, assignedTo: userId || null });
  };

  const getAssigneeEmail = (userId: string | null) => {
    if (!userId) {
      return "Unassigned";
    }
    return team.find((p) => p.userId === userId)?.email || "Assigned";
  };

  return (
    <div className="flex h-full flex-col p-4 gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-cosmic-text">Leads</h2>
          <p className="text-sm text-cosmic-muted">{leads.length} prospects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" />
            CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleCsvImport(file);
          }
        }}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cosmic-muted" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-cosmic-border bg-cosmic-surface pl-10 pr-3 text-cosmic-text outline-none focus:border-cosmic-violet"
        />
      </div>

      <Tabs tabs={STATUS_TABS} activeTab={filter} onTabChange={setFilter} />

      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-2">
        {isLoading ? (
          <div className="h-20 rounded-xl bg-cosmic-surface animate-pulse" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-cosmic-muted py-12">No leads found. Import CSV or add manually.</p>
        ) : (
          filtered.map((lead) => (
            <Card key={lead.id} className="flex flex-col gap-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-cosmic-text truncate">{lead.name}</span>
                    <Badge variant="muted">{LEAD_STATUS_LABELS[lead.status]}</Badge>
                  </div>
                  <p className="text-sm text-cosmic-muted">{formatDisplayNumber(lead.phone)}</p>
                  {lead.company ? <p className="text-xs text-cosmic-muted">{lead.company}</p> : null}
                  <p className="text-xs text-cosmic-muted mt-1 flex items-center gap-1">
                    <UserPlus className="size-3" />
                    {getAssigneeEmail(lead.assignedTo)}
                  </p>
                </div>
                <Button variant="success" size="sm" onClick={() => handleCall(lead)}>
                  <Phone className="size-4" />
                  Call
                </Button>
              </div>
              <select
                value={lead.assignedTo || ""}
                onChange={(e) => assignLead(lead, e.target.value)}
                className="h-8 rounded-lg border border-cosmic-border bg-cosmic-bg px-2 text-xs text-cosmic-text"
              >
                <option value="">Unassigned</option>
                {team.map((member) => (
                  <option key={member.userId} value={member.userId}>{member.email}</option>
                ))}
              </select>
            </Card>
          ))
        )}
      </div>

      {showAdd ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Lead</h3>
            <div className="flex flex-col gap-3">
              <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
              <Input label="Phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              <Input label="Company" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} />
              <Input label="Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={handleAdd}>Add Lead</Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
