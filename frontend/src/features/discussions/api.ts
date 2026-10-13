import { FetchHttpClient, type HttpClient } from "@/lib/http";
import type {
  DiscussionCreate,
  DiscussionPage,
  DiscussionSaved,
} from "./types";

export class DiscussionsApi {
  constructor(private readonly http: HttpClient) {}
  list(
    leadId: string,
    cursor: string | null,
    signal?: AbortSignal,
  ): Promise<DiscussionPage> {
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("cursor", cursor);
    return this.http.request(`/leads/${leadId}/discussions?${params}`, {
      signal,
    });
  }
  create(leadId: string, data: DiscussionCreate): Promise<DiscussionSaved> {
    return this.http.request(`/leads/${leadId}/discussions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
export const discussionsApi = new DiscussionsApi(
  new FetchHttpClient("/api/v1"),
);
