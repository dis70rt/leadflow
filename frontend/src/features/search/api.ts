import { FetchHttpClient, type HttpClient } from "@/lib/http";
import type { Suggestions } from "./types";

export class SuggestionsApi {
  constructor(private readonly http: HttpClient) {}
  suggest(query: string, signal?: AbortSignal): Promise<Suggestions> {
    const params = new URLSearchParams({ q: query.trim(), limit: "5" });
    return this.http.request(`/leads/suggestions?${params}`, { signal });
  }
}
export const suggestionsApi = new SuggestionsApi(
  new FetchHttpClient("/api/v1"),
);
