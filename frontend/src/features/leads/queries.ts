import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { leadsApi } from "./api";
import {
  STATUSES,
  type Lead,
  type LeadCreate,
  type LeadFilters,
  type LeadUpdate,
} from "./types";

export const leadKeys = {
  all: ["leads"] as const,
  lists: ["leads", "list"] as const,
  detail: (id: string) => ["leads", "detail", id] as const,
};
export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: [...leadKeys.lists, filters],
    queryFn: ({ signal }) => leadsApi.list(filters, signal),
    placeholderData: keepPreviousData,
    refetchInterval: filters.search ? 5000 : false,
  });
}
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: ({ signal }) => leadsApi.get(id, signal),
  });
}
export function useLeadCounts() {
  const queries = useQueries({
    queries: ["all", ...STATUSES].map((status) => ({
      queryKey: ["leads", "count", status],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        leadsApi.count(status === "all" ? undefined : status, signal),
    })),
  });
  return Object.fromEntries(
    ["all", ...STATUSES].map((status, index) => [
      status,
      queries[index].data?.total,
    ]),
  );
}
export function useSyncLead() {
  const client = useQueryClient();
  return async (lead: Lead) => {
    client.setQueryData(leadKeys.detail(lead.id), lead);
    await client.invalidateQueries({ queryKey: leadKeys.all });
  };
}
export function useCreateLead() {
  const sync = useSyncLead();
  return useMutation({
    mutationFn: (data: LeadCreate) => leadsApi.create(data),
    onSuccess: sync,
  });
}
export function useUpdateLead(id: string) {
  const sync = useSyncLead();
  return useMutation({
    mutationFn: (data: LeadUpdate) => leadsApi.update(id, data),
    onSuccess: sync,
  });
}
