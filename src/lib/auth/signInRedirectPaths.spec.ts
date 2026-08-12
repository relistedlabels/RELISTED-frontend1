import { describe, expect, test } from "bun:test";
import {
  isPublicBrowseRoute,
  shouldSuppressSignInRedirect,
} from "./signInRedirectPaths";

describe("isPublicBrowseRoute", () => {
  test("includes shop and nested shop routes", () => {
    expect(isPublicBrowseRoute("/shop")).toBe(true);
    expect(isPublicBrowseRoute("/shop/product-details/abc")).toBe(true);
  });

  test("excludes protected app areas", () => {
    expect(isPublicBrowseRoute("/listers/inventory")).toBe(false);
    expect(isPublicBrowseRoute("/renters/orders")).toBe(false);
  });
});

describe("shouldSuppressSignInRedirect", () => {
  test("suppresses on auth and admin routes", () => {
    expect(shouldSuppressSignInRedirect("/auth/sign-in")).toBe(true);
    expect(shouldSuppressSignInRedirect("/admin/k340eol21/orders")).toBe(true);
  });

  test("suppresses on public browse routes (shop bug fix)", () => {
    expect(shouldSuppressSignInRedirect("/shop")).toBe(true);
    expect(shouldSuppressSignInRedirect("/shop?page=2")).toBe(false);
    expect(shouldSuppressSignInRedirect("/style-spotlight")).toBe(true);
  });

  test("does not suppress on protected renter/lister routes", () => {
    expect(shouldSuppressSignInRedirect("/renters/wallet")).toBe(false);
    expect(shouldSuppressSignInRedirect("/listers/dashboard")).toBe(false);
  });
});
