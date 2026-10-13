import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/[...path]/route";
import { SuggestionsApi } from "@/features/search/api";

afterEach(() => vi.unstubAllGlobals());
describe("suggestion contracts", () => {
  it("encodes a trimmed query and forwards cancellation", async () => {
    const request = vi.fn().mockResolvedValue({ items: [] });
    const signal = new AbortController().signal;
    await new SuggestionsApi({ request }).suggest("  team pricing  ", signal);
    expect(request).toHaveBeenCalledWith(
      "/leads/suggestions?q=team+pricing&limit=5",
      { signal },
    );
  });
  it("proxies the suggestions endpoint to FastAPI", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [] }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);
    const response = await GET(
      new NextRequest("http://localhost/api/v1/leads/suggestions?q=pricng"),
      { params: Promise.resolve({ path: ["v1", "leads", "suggestions"] }) },
    );
    expect(response.status).toBe(200);
    expect(fetcher.mock.calls[0][0]).toContain(
      "/api/v1/leads/suggestions?q=pricng",
    );
  });
  it("rejects unrelated proxy endpoints", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await GET(new NextRequest("http://localhost/api/admin"), {
      params: Promise.resolve({ path: ["admin"] }),
    });
    expect(response.status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
