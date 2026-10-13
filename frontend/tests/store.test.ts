import { beforeEach, describe, expect, it } from "vitest";
import { useWorkspace } from "@/features/workspace/store";

beforeEach(() => useWorkspace.getState().reset());
describe("workspace state", () => {
  it("resets pagination when filters change", () => {
    useWorkspace.getState().setPage(3);
    useWorkspace.getState().setStatus("qualified");
    expect(useWorkspace.getState().page).toBe(0);
    useWorkspace.getState().setPage(2);
    useWorkspace.getState().setSearch("pricing");
    expect(useWorkspace.getState().page).toBe(0);
  });
  it("clears selected leads and filters on session reset", () => {
    useWorkspace.getState().selectLead("lead-id");
    useWorkspace.getState().setSearch("pricing");
    useWorkspace.getState().setAddLeadOpen(true);
    useWorkspace.getState().reset();
    expect(useWorkspace.getState()).toMatchObject({
      selectedLeadId: null,
      search: "",
      addLeadOpen: false,
      status: "all",
      page: 0,
    });
  });
});
