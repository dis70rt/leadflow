import { test, expect } from "./fixtures";

test("shows historical discussion snippets and opens a lead with the keyboard", async ({
  page,
}) => {
  await page.route("**/api/v1/leads/suggestions?*", async (route) => {
    await route.fulfill({
      json: {
        items: [
          {
            id: "00000000-0000-4000-8000-000000000001",
            name: "Jamie Chen",
            company: "Northstar Studio",
            phone: "555-0140",
            status: "qualified",
            match_field: "discussion",
            snippet:
              "Earlier call: \ue000onboarding\ue001 needs and <script>alert(1)</script>.",
          },
        ],
      },
    });
  });
  const search = page.getByRole("combobox", {
    name: "Search leads and discussions",
  });
  await search.fill("onbaording");
  await expect(page.getByRole("listbox").getByRole("option")).toContainText(
    "Discussion",
  );
  await expect(
    page.getByRole("listbox").getByRole("option").locator("mark"),
  ).toHaveText("onboarding");
  await expect(
    page.getByRole("listbox").getByRole("option").locator("script"),
  ).toHaveCount(0);
  await search.press("ArrowUp");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await search.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Jamie Chen");
});

test("dismisses suggestions without clearing search and supports mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const search = page.getByRole("combobox", {
    name: "Search leads and discussions",
  });
  await search.fill("pricing");
  await expect(page.getByRole("listbox")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await search.press("Escape");
  await expect(search).toHaveValue("pricing");
  await expect(page.getByRole("listbox")).not.toBeVisible();
  await search.fill("team pricing");
  await page.getByRole("listbox").getByRole("option").click();
  await expect(page.getByRole("dialog")).toContainText("Jamie Chen");
});

test("shows a graceful suggestion-service error", async ({ page }) => {
  await page.route("**/api/v1/leads/suggestions?*", async (route) => {
    await route.fulfill({
      status: 503,
      json: { error: { message: "Search unavailable" } },
    });
  });
  await page
    .getByRole("combobox", { name: "Search leads and discussions" })
    .fill("pricing");
  await expect(page.getByText("Suggestions unavailable.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
});

test("autocompletes the first name with Tab and opens it with Enter", async ({
  page,
}) => {
  const search = page.getByRole("combobox", {
    name: "Search leads and discussions",
  });
  await search.fill("pricing");
  await expect(page.getByRole("listbox").getByRole("option")).toBeVisible();
  await search.press("Tab");
  await expect(search).toHaveValue("Jamie Chen");
  await expect(search).toBeFocused();
  await expect(page.getByRole("listbox")).not.toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await search.fill("Jamie");
  await expect(page.getByRole("listbox").getByRole("option")).toBeVisible();
  await search.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Jamie Chen");
});
