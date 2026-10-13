import { describe, expect, it, vi, afterEach } from "vitest";
import { LeadsApi } from "@/features/leads/api";
import { DiscussionsApi } from "@/features/discussions/api";
import { FetchHttpClient, ApiError } from "@/lib/http";

afterEach(() => vi.unstubAllGlobals());
describe("API adapters", () => {
  it("encodes filters and backend pagination", async () => {
    const request = vi.fn().mockResolvedValue({ items: [] });
    await new LeadsApi({ request }).list({
      search: "pricing & onboarding",
      status: "qualified",
      page: 2,
    });
    const params = new URLSearchParams(request.mock.calls[0][0].split("?")[1]);
    expect(params.get("q")).toBe("pricing & onboarding");
    expect(params.get("offset")).toBe("24");
    expect(params.get("status")).toBe("qualified");
  });
  it("omits empty search and all-status parameters", async () => {
    const request = vi.fn().mockResolvedValue({});
    await new LeadsApi({ request }).list({
      search: " ",
      status: "all",
      page: 0,
    });
    expect(request.mock.calls[0][0]).not.toContain("status=");
    expect(request.mock.calls[0][0]).not.toContain("q=");
  });
  it("preserves explicit reminder clearing", async () => {
    const request = vi.fn().mockResolvedValue({});
    await new LeadsApi({ request }).update("id", { follow_up_at: null });
    expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({
      follow_up_at: null,
    });
  });
  it("sends cursor and discussion fields without changing them", async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new DiscussionsApi({ request });
    await api.list("id", "opaque+cursor");
    expect(request.mock.calls[0][0]).toContain("cursor=opaque%2Bcursor");
    await api.create("id", { note: "A conversation" });
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({
      note: "A conversation",
    });
  });
  it("surfaces structured backend errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: "Search unavailable" },
          }),
          { status: 503 },
        ),
      ),
    );
    await expect(
      new FetchHttpClient("/api/v1").request("/leads"),
    ).rejects.toMatchObject({
      status: 503,
      message: "Search unavailable",
      name: "ApiError",
    } satisfies Partial<ApiError>);
  });
});
