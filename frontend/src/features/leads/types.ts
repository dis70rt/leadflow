export const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof STATUSES)[number];
export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
};
export interface Lead {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  follow_up_at: string | null;
  follow_up_state: "none" | "overdue" | "today" | "upcoming";
  last_note: string | null;
  last_discussion_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface LeadPage {
  items: Lead[];
  total: number;
  limit: number;
  offset: number;
}
export interface LeadCreate {
  name: string;
  company?: string | null;
  phone?: string | null;
}
export interface LeadUpdate {
  status?: LeadStatus;
  follow_up_at?: string | null;
}
export interface LeadFilters {
  search: string;
  status: LeadStatus | "all";
  page: number;
}
