import { test as base } from "@playwright/test";

/** Shared fixture: block slow third-party requests during e2e. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (
        /google-analytics|googletagmanager|facebook\.net|hotjar|segment\.io/i.test(
          url,
        )
      ) {
        return route.abort();
      }
      return route.continue();
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
