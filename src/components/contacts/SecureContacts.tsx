"use client";

import { useState } from "react";
import { Plus, Search, Phone, Shield, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useContacts } from "@/hooks/useContacts";
import { useApp } from "@/providers/AppProvider";
import { generateId, formatDisplayNumber } from "@/lib/utils";
import type { SecureContact } from "@/lib/types";

export function SecureContacts() {
  const { contacts, isLoading, addContact, updateContact, deleteContact } = useContacts();
  const { startCall } = useApp();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<SecureContact | null>(null);
  const [formName, setFormName] = useState("");
  const [formNumber, setFormNumber] = useState("");
  const [formKey, setFormKey] = useState("");

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.number.includes(search),
  );

  const openAddForm = () => {
    setEditingContact(null);
    setFormName("");
    setFormNumber("");
    setFormKey("");
    setShowAddForm(true);
  };

  const openEditForm = (contact: SecureContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormNumber(contact.number);
    setFormKey(contact.cryptoKey);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formNumber.trim()) {
      return;
    }

    if (editingContact) {
      updateContact({
        ...editingContact,
        name: formName.trim(),
        number: formNumber.trim(),
        cryptoKey: formKey.trim() || generateId(),
      });
    } else {
      addContact({
        id: generateId(),
        name: formName.trim(),
        number: formNumber.trim(),
        cryptoKey: formKey.trim() || generateId(),
      });
    }

    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleDial = (contact: SecureContact) => {
    startCall(contact.number, contact.name);
  };

  return (
    <div className="flex h-full flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-cosmic-text">Secure Contacts</h2>
          <p className="text-sm text-cosmic-muted">{contacts.length} encrypted entries</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddForm}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cosmic-muted" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-cosmic-border bg-cosmic-surface pl-10 pr-3 text-cosmic-text placeholder:text-cosmic-muted/60 outline-none transition-colors duration-200 focus:border-cosmic-violet"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-cosmic-surface animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="size-12 text-cosmic-muted/40 mb-4" />
            <p className="text-cosmic-muted">No secure contacts found</p>
          </div>
        ) : (
          filtered.map((contact) => (
            <Card key={contact.id} className="flex items-center gap-3 p-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cosmic-violet/20">
                <Shield className="size-5 text-cosmic-violet-light" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-cosmic-text truncate">{contact.name}</span>
                  <Badge variant="success">Secure</Badge>
                </div>
                <p className="text-sm text-cosmic-muted">{formatDisplayNumber(contact.number)}</p>
                <p className="text-xs text-cosmic-muted/60 font-mono truncate mt-0.5">
                  Key: {contact.cryptoKey.slice(0, 12)}...
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleDial(contact)}>
                  <Phone className="size-4 text-cosmic-green" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditForm(contact)}>
                  <Edit2 className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteContact(contact.id)}>
                  <Trash2 className="size-4 text-cosmic-red" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {showAddForm ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-cosmic-text mb-4">
              {editingContact ? "Edit Contact" : "Add Secure Contact"}
            </h3>
            <div className="flex flex-col gap-3">
              <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Contact name" />
              <Input label="Phone Number" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} placeholder="+1 555 000 0000" />
              <Input label="Crypto Key (optional)" value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="Auto-generated if empty" />
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleSave}>
                  {editingContact ? "Save" : "Add Contact"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
