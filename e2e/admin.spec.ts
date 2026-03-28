import { expect, test } from "@playwright/test";

test.describe("Admin Pages", () => {
  test("should show not-found for unauthenticated user on admin page", async ({
    page,
  }) => {
    await page.goto("/admin/k340eol21/listings");

    // Admin routes rewrite to /not-found (404) for unauthenticated users
    await expect(page.getByText("Page Not Found")).toBeVisible({
      timeout: 5000,
    });
  });
});
