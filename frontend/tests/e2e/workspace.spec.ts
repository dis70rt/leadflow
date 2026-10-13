import { test, expect } from "./fixtures";

test("creates a lead and reflects saved conversation and status", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add new lead" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Morgan Ellis");
  await dialog.getByLabel("Company").fill("Cedar Works");
  await dialog.getByRole("button", { name: "Add lead", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Open Morgan Ellis" }).click();
  await dialog.getByLabel("Lead status").selectOption("proposal_sent");
  await expect(dialog.getByLabel("Lead status")).toHaveValue("proposal_sent");
  await dialog
    .getByLabel("Keep the conversation going")
    .fill("Shared annual pricing proposal");
  await dialog.getByLabel("Set follow-up", { exact: true }).check();
  const date = new Date(Date.now() + 86400000);
  const local = new Date(+date - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  await dialog.getByLabel("Follow-up date and time").fill(local);
  await dialog.getByRole("button", { name: "Save note" }).click();
  await expect(
    dialog.getByText("Shared annual pricing proposal", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText(/Next follow-up/)).toBeVisible();
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  const row = page.getByRole("button", { name: "Open Morgan Ellis" });
  await expect(row).toContainText("Shared annual pricing proposal");
  await expect(row).toContainText("Proposal sent");
});

test("filters, searches discussion text, and shows empty results", async ({
  page,
}) => {
  await page.getByLabel("Search leads and discussions").fill("team pricing");
  await expect(
    page.getByRole("button", { name: "Open Jamie Chen" }),
  ).toBeVisible();
  await page.getByLabel("Filter by status").selectOption("won");
  await expect(page.getByText("No connections found")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page.getByRole("button", { name: "Open Jamie Chen" }),
  ).toBeVisible();
});

test("persists theme, supports keyboard dismissal and demo sign-out", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Switch to light mode" })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Open Jamie Chen" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("button", { name: "Enter workspace" }),
  ).toBeVisible();
});

test("mobile layout stays inside viewport and lead dialog works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Open Jamie Chen" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open Jamie Chen" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("keeps a failed lead draft and confirms before discarding it", async ({
  page,
}) => {
  await page.route("**/api/v1/leads", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 503,
        json: { error: { message: "Database temporarily unavailable" } },
      });
    } else await route.fallback();
  });
  await page.getByRole("button", { name: "Add new lead" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Draft Connection");
  await dialog.getByRole("button", { name: "Add lead", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Database temporarily unavailable",
  );
  await expect(dialog.getByLabel("Full name")).toHaveValue("Draft Connection");
  page.once("dialog", (confirmation) => confirmation.dismiss());
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  page.once("dialog", (confirmation) => confirmation.accept());
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
});
