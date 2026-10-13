import { test, expect } from "@playwright/test";

const wings = ".hairline-stage > svg > g > path";

test("landing plane supports pointer guidance and keyboard playback", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  await expect(page.locator(wings)).toHaveCount(7);
  const pause = page.getByRole("button", { name: "Pause flight" });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Play flight" }),
  ).toHaveAttribute("aria-pressed", "false");
  const before = await page.locator(wings).first().getAttribute("d");
  await page.locator(".hairline-stage").hover({ position: { x: 65, y: 100 } });
  await expect(page.locator(wings).first()).not.toHaveAttribute("d", before!);
  await page.mouse.move(1400, 20);
  await page.locator(":focus").evaluateAll((elements) => {
    elements.forEach((element) => (element as HTMLElement).blur());
  });
  await page.screenshot({
    path: info.outputPath("landing-hairline-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
  await page.screenshot({
    path: info.outputPath("landing-hairline-light.png"),
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
    path: info.outputPath("landing-hairline-mobile-light-refined.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
  await page.screenshot({
    path: info.outputPath("landing-hairline-mobile-dark-refined.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("reduced motion keeps the plane still without autoplay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(wings)).toHaveCount(7);
  await expect(page.locator(".plane-play")).toBeHidden();
  const before = await page.locator(wings).first().getAttribute("d");
  await page.waitForTimeout(1200);
  await expect(page.locator(wings).first()).toHaveAttribute("d", before!);
});

test("landing keeps a static illustration when the engine cannot load", async ({
  page,
}) => {
  await page.route("**/illustrations/hairline/kernel.js", (route) =>
    route.abort(),
  );
  await page.goto("/");
  await expect(page.locator(".plane-fallback")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enter workspace" }),
  ).toBeEnabled();
});
