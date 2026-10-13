import type { LeadStatus } from "@/features/leads/types";
export interface LeadSuggestion {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  match_field: "discussion" | "name" | "company" | "phone" | null;
  snippet: string | null;
}
export interface Suggestions {
  items: LeadSuggestion[];
}
