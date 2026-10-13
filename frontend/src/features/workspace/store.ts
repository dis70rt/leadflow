import { create } from "zustand";
import type { LeadStatus } from "@/features/leads/types";

interface WorkspaceState {
  search: string;
  status: LeadStatus | "all";
  page: number;
  selectedLeadId: string | null;
  addLeadOpen: boolean;
  setSearch: (search: string) => void;
  setStatus: (status: LeadStatus | "all") => void;
  setPage: (page: number) => void;
  selectLead: (id: string | null) => void;
  setAddLeadOpen: (open: boolean) => void;
  reset: () => void;
}
const initial = {
  search: "",
  status: "all" as const,
  page: 0,
  selectedLeadId: null,
  addLeadOpen: false,
};
export const useWorkspace = create<WorkspaceState>((set) => ({
  ...initial,
  setSearch: (search) => set({ search, page: 0 }),
  setStatus: (status) => set({ status, page: 0 }),
  setPage: (page) => set({ page: Math.max(0, page) }),
  selectLead: (selectedLeadId) => set({ selectedLeadId }),
  setAddLeadOpen: (addLeadOpen) => set({ addLeadOpen }),
  reset: () => set(initial),
}));
