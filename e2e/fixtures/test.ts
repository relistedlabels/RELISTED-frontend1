import { test as base } from "@playwright/test";

/** Shared fixture: block slow third-party requests during e2e. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("relisted-onboarding-prompt-dismissed", "1");
    });

    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (
        /google-analytics|googletagmanager|facebook\.net|hotjar|segment\.io/i.test(
          url,
        )
      ) {
        return route.abort();
      }
      return route.fallback();
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
