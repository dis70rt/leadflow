import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSyncLead } from "@/features/leads/queries";
import { discussionsApi } from "./api";
import type { DiscussionCreate } from "./types";

export function useDiscussions(id: string) {
  return useInfiniteQuery({
    queryKey: ["discussions", id],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      discussionsApi.list(id, pageParam, signal),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
}
export function useCreateDiscussion(id: string) {
  const client = useQueryClient();
  const sync = useSyncLead();
  return useMutation({
    mutationFn: (data: DiscussionCreate) => discussionsApi.create(id, data),
    onSuccess: async (result) => {
      await Promise.all([
        sync(result.lead),
        client.invalidateQueries({ queryKey: ["discussions", id] }),
      ]);
    },
  });
}
