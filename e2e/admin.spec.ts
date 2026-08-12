import { expect, test } from "./fixtures/test";

test.describe("Admin Pages", () => {
  test("@smoke should show not-found for unauthenticated user on admin page", async ({
    page,
  }) => {
    await page.goto("/admin/k340eol21/listings", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByText("Page Not Found")).toBeVisible({
      timeout: 5_000,
    });
  });
});
