import { test, expect } from "./fixtures";

test("shows lead and timeline skeletons until requests finish", async ({
  page,
}) => {
  let releaseList!: () => void;
  const listReady = new Promise<void>((resolve) => {
    releaseList = resolve;
  });
  await page.route("**/api/v1/leads?limit=12&offset=0", async (route) => {
    await listReady;
    await route.fallback();
  });
  await page.reload();
  const list = page.getByRole("status").filter({ hasText: "Loading leads" });
  await expect(list).toBeVisible();
  await expect(list).toHaveAttribute("aria-busy", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await list
      .locator(".skeleton")
      .first()
      .evaluate(
        (element) => getComputedStyle(element, "::after").animationName,
      ),
  ).toBe("none");
  releaseList();
  await expect(list).not.toBeVisible();

  let releaseTimeline!: () => void;
  const timelineReady = new Promise<void>((resolve) => {
    releaseTimeline = resolve;
  });
  await page.route("**/discussions?limit=20", async (route) => {
    await timelineReady;
    await route.fallback();
  });
  await page.getByRole("button", { name: "Open Jamie Chen" }).click();
  const timeline = page
    .getByRole("status")
    .filter({ hasText: "Loading conversations" });
  await expect(timeline).toBeVisible();
  releaseTimeline();
  await expect(timeline).not.toBeVisible();
  await expect(
    page.getByText("Every relationship starts with hello."),
  ).toBeVisible();
});
