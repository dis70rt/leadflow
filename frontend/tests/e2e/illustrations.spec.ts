import { test, expect } from "@playwright/test";

test("landing workflow moves activity between CRM stages", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /LeadFlow brings leads/ }),
  ).toBeVisible();
  await expect(page.locator(".crm-workflow")).toHaveAttribute(
    "data-motion",
    "running",
  );
  for (const label of [
    "New leads",
    "Discussions",
    "Reminders",
    "Qualified",
    "Follow-up",
    "Won",
  ]) {
    await expect(
      page.locator(".workflow-node").getByText(label, { exact: true }),
    ).toBeVisible();
  }
  const packet = page.locator(".workflow-packet").first();
  const position = () =>
    packet.evaluate((node) => {
      const matrix = (node as SVGGraphicsElement).getCTM();
      return [matrix?.e, matrix?.f];
    });
  const before = await position();
  await expect.poll(position).not.toEqual(before);
  await page.mouse.move(1400, 20);
  await page.locator(":focus").evaluateAll((elements) => {
    elements.forEach((element) => (element as HTMLElement).blur());
  });
  await page.screenshot({
    path: info.outputPath("landing-workflow-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
  await page.screenshot({
    path: info.outputPath("landing-workflow-light.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Enter workspace" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("landing-workflow-mobile-light-refined.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
  await page.screenshot({
    path: info.outputPath("landing-workflow-mobile-dark-refined.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("reduced motion keeps the workflow readable without moving dots", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".crm-workflow")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await expect(page.locator(".workflow-packet").first()).toBeHidden();
  await expect(page.locator(".workflow-hub")).toContainText("LeadFlow");
});
