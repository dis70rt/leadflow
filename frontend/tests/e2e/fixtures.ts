import { test as base, expect } from "@playwright/test";
import type { Lead } from "../../src/features/leads/types";

export const test = base.extend<{ workspace: void }>({
  workspace: [
    async ({ page }, use) => {
      const now = new Date().toISOString();
      const leads: Lead[] = [
        {
          id: "00000000-0000-4000-8000-000000000001",
          name: "Jamie Chen",
          company: "Northstar Studio",
          phone: "555-0140",
          status: "qualified",
          follow_up_at: null,
          follow_up_state: "none",
          last_note: "Discussed team pricing",
          last_discussion_at: now,
          created_at: now,
          updated_at: now,
        },
      ];
      const notes: Record<
        string,
        {
          id: string;
          lead_id: string;
          note: string;
          created_at: string;
          follow_up_at: string | null;
        }[]
      > = {};
      await page.route("**/api/v1/leads**", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const parts = url.pathname.split("/").filter(Boolean);
        const id = parts[3];
        const lead = leads.find((item) => item.id === id);
        if (parts[4] === "discussions" && lead) {
          if (request.method() === "POST") {
            const body = request.postDataJSON();
            const discussion = {
              id: crypto.randomUUID(),
              lead_id: id,
              note: body.note,
              created_at: new Date().toISOString(),
              follow_up_at: body.follow_up_at ?? null,
            };
            notes[id] = [discussion, ...(notes[id] ?? [])];
            Object.assign(lead, {
              last_note: body.note,
              last_discussion_at: discussion.created_at,
            });
            if (body.follow_up_at) lead.follow_up_at = body.follow_up_at;
            await route.fulfill({ status: 201, json: { discussion, lead } });
          } else
            await route.fulfill({
              json: { items: notes[id] ?? [], next_cursor: null },
            });
        } else if (id && lead) {
          if (request.method() === "PATCH") {
            Object.assign(lead, request.postDataJSON());
            if (["won", "lost"].includes(lead.status)) lead.follow_up_at = null;
          }
          await route.fulfill({ json: lead });
        } else if (request.method() === "POST") {
          const added = {
            ...leads[0],
            ...request.postDataJSON(),
            id: crypto.randomUUID(),
            status: "new",
            last_note: null,
            last_discussion_at: null,
            follow_up_at: null,
          } as Lead;
          leads.unshift(added);
          await route.fulfill({ status: 201, json: added });
        } else {
          const status = url.searchParams.get("status");
          const q = url.searchParams.get("q")?.toLowerCase();
          const filtered = leads.filter(
            (item) =>
              (!status || item.status === status) &&
              (!q ||
                `${item.name} ${item.company} ${item.last_note}`
                  .toLowerCase()
                  .includes(q)),
          );
          const limit = Number(url.searchParams.get("limit") ?? 12);
          const offset = Number(url.searchParams.get("offset") ?? 0);
          await route.fulfill({
            json: {
              items: filtered.slice(offset, offset + limit),
              total: filtered.length,
              limit,
              offset,
            },
          });
        }
      });
      await page.goto("/");
      await page.getByLabel("Your name").fill("Alex Morgan");
      await page.getByLabel("Email address").fill("alex@example.com");
      await page.getByRole("button", { name: "Enter workspace" }).click();
      await expect(
        page.getByRole("heading", { name: "Your leads, in focus." }),
      ).toBeVisible();
      await use();
    },
    { auto: true },
  ],
});
export { expect };
