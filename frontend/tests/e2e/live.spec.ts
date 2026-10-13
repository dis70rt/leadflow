import { test, expect } from "@playwright/test";

test("real API saves lead, timeline, status, reminder, and searchable discussion", async ({
  page,
}) => {
  test.skip(
    process.env.LIVE_BACKEND_TESTS !== "1",
    "Opt in against the isolated test backend",
  );
  const name = `Browser test ${Date.now()}`;
  const token = `conversation${Date.now()}`;
  await page.goto("/");
  await page.getByLabel("Your name").fill("Workflow Tester");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await page.getByRole("button", { name: "Add new lead" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill(name);
  await dialog.getByLabel("Company").fill("Isolated browser tests");
  await dialog.getByRole("button", { name: "Add lead", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: `Open ${name}` }).click();
  await dialog.getByLabel("Lead status").selectOption("qualified");
  await expect(dialog.getByLabel("Lead status")).toHaveValue("qualified");
  await dialog.getByLabel("Keep the conversation going").fill(token);
  await dialog.getByLabel("Set follow-up", { exact: true }).check();
  const date = new Date(Date.now() + 86400000);
  const local = new Date(+date - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  await dialog.getByLabel("Follow-up date and time").fill(local);
  await dialog.getByRole("button", { name: "Save note" }).click();
  await expect(dialog.getByText(token, { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Next follow-up/)).toBeVisible();
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  const row = page.getByRole("button", { name: `Open ${name}` });
  await expect(row).toContainText(token);
  await expect(row).toContainText("Qualified");
  await expect
    .poll(
      async () => {
        const response = await page.request.get(`/api/v1/leads?q=${token}`);
        return response.ok() ? (await response.json()).total : 0;
      },
      { timeout: 15000 },
    )
    .toBe(1);
  await page.getByLabel("Search leads and discussions").fill(token);
  await expect(row).toBeVisible();
});
