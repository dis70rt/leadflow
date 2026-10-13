import type { HttpClient } from "@/lib/http";
import { FetchHttpClient } from "@/lib/http";
import type {
  Lead,
  LeadCreate,
  LeadFilters,
  LeadPage,
  LeadUpdate,
} from "./types";

export const PAGE_SIZE = 12;
export class LeadsApi {
  constructor(private readonly http: HttpClient) {}
  list(filters: LeadFilters, signal?: AbortSignal): Promise<LeadPage> {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(filters.page * PAGE_SIZE),
    });
    if (filters.search.trim()) params.set("q", filters.search.trim());
    if (filters.status !== "all") params.set("status", filters.status);
    return this.http.request(`/leads?${params}`, { signal });
  }
  count(status?: string, signal?: AbortSignal): Promise<LeadPage> {
    return this.http.request(
      `/leads?limit=1${status ? `&status=${status}` : ""}`,
      { signal },
    );
  }
  get(id: string, signal?: AbortSignal): Promise<Lead> {
    return this.http.request(`/leads/${id}`, { signal });
  }
  create(data: LeadCreate): Promise<Lead> {
    return this.http.request("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  update(id: string, data: LeadUpdate): Promise<Lead> {
    return this.http.request(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}
export const leadsApi = new LeadsApi(new FetchHttpClient("/api/v1"));
