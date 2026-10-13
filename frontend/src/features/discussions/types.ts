import type { Lead } from "@/features/leads/types";
export interface Discussion {
  id: string;
  lead_id: string;
  note: string;
  follow_up_at: string | null;
  created_at: string;
}
export interface DiscussionPage {
  items: Discussion[];
  next_cursor: string | null;
}
export interface DiscussionCreate {
  note: string;
  follow_up_at?: string;
}
export interface DiscussionSaved {
  discussion: Discussion;
  lead: Lead;
}
