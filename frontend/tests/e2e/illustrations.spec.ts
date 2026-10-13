import { test, expect } from "@playwright/test";

const wings = ".hairline-stage > svg > g > path";

test("landing plane flies automatically without caption or controls", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  await expect(page.locator(wings)).toHaveCount(7);
  await expect(page.locator(".plane-play")).toHaveCount(0);
  await expect(
    page.getByText("A little follow-through goes a long way."),
  ).toHaveCount(0);
  const plane = page.locator(".hairline-stage > svg > g");
  await expect(plane).toHaveAttribute("transform", /translate/);
  const before = await plane.getAttribute("transform");
  await expect(plane).not.toHaveAttribute("transform", before!);
  await page.mouse.move(1400, 20);
  await page.locator(":focus").evaluateAll((elements) => {
    elements.forEach((element) => (element as HTMLElement).blur());
  });
  await page.screenshot({
    path: info.outputPath("landing-flight-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
  await page.screenshot({
    path: info.outputPath("landing-flight-light.png"),
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
    path: info.outputPath("landing-flight-mobile-light-refined.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/theme-reveal/);
  await page.screenshot({
    path: info.outputPath("landing-flight-mobile-dark-refined.png"),
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
  await expect(page.locator(".hairline-stage > svg > g")).not.toHaveAttribute(
    "transform",
  );
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
