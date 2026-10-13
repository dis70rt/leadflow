import { useQuery } from "@tanstack/react-query";
import { useDebounced } from "@/lib/use-debounced";
import { suggestionsApi } from "./api";

export function useSuggestions(value: string, focused: boolean) {
  const query = useDebounced(value.trim(), 250);
  const results = useQuery({
    queryKey: ["leads", "suggestions", query],
    queryFn: ({ signal }) => suggestionsApi.suggest(query, signal),
    enabled: focused && query.length >= 2,
    staleTime: 5000,
    retry: false,
  });
  return { ...results, waiting: query !== value.trim() || results.isPending };
}
