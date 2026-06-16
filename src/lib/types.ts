export type UserRole = "agent" | "admin";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "callback"
  | "not_interested"
  | "converted"
  | "do_not_call";

export type CallDisposition =
  | "connected"
  | "no_answer"
  | "voicemail"
  | "interested"
  | "callback"
  | "not_interested"
  | "wrong_number"
  | "do_not_call";

export type VoiceMode = "browser" | "phone";

export interface Profile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  agentPhone: string;
}

export interface Lead {
  id: string;
  assignedTo: string | null;
  createdBy: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
  status: LeadStatus;
  source: string;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CallLogEntry {
  id: string;
  number: string;
  name: string;
  timestamp: string;
  durationSeconds: number;
  isIncoming: boolean;
  isMissed: boolean;
  isSecure: boolean;
  twilioCallSid?: string;
  recordingSid?: string;
  recordingStatus?: "none" | "processing" | "completed" | "failed";
  recordingDurationSeconds?: number;
  leadId?: string;
  disposition?: CallDisposition;
  notes?: string;
  userId?: string;
}

export interface SecureContact {
  id: string;
  name: string;
  number: string;
  cryptoKey: string;
}

export interface AppSettings {
  routingProtocol: "cellular" | "twilio";
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
  recordCalls: boolean;
  voiceMode: VoiceMode;
}

export type HandshakeStep = {
  id: number;
  label: string;
  status: "pending" | "active" | "complete";
};

export type ActiveCallState = {
  number: string;
  name: string;
  callSid: string | null;
  isConnected: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isScramblerOn: boolean;
  startTime: number | null;
  handshakeComplete: boolean;
  leadId?: string;
};

export type PendingDisposition = {
  callLogId: string;
  number: string;
  name: string;
  durationSeconds: number;
  twilioCallSid?: string;
  recordingStatus?: CallLogEntry["recordingStatus"];
  leadId?: string;
};

export type ScreenId = "dial" | "leads" | "recents" | "admin" | "settings";

export interface AdminStats {
  callsToday: number;
  leadsNew: number;
  leadsInterested: number;
  leadsCallback: number;
  callsByAgent: Array<{ userId: string; email: string; count: number }>;
  dispositions: Array<{ disposition: string; count: number }>;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  callback: "Callback",
  not_interested: "Not Interested",
  converted: "Converted",
  do_not_call: "Do Not Call",
};

export const DISPOSITION_LABELS: Record<CallDisposition, string> = {
  connected: "Connected",
  no_answer: "No Answer",
  voicemail: "Voicemail",
  interested: "Interested",
  callback: "Callback Requested",
  not_interested: "Not Interested",
  wrong_number: "Wrong Number",
  do_not_call: "Do Not Call",
};
