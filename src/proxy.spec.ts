import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

test("does not redirect logged-out users based on a stale admin role cookie", () => {
  const response = proxy(
    new NextRequest("http://localhost/about", {
      headers: { cookie: "user_role=ADMIN" },
    }),
  );

  expect(response.headers.get("location")).toBeNull();
});

test("keeps authenticated admins within admin routes", () => {
  const response = proxy(
    new NextRequest("http://localhost/about", {
      headers: { cookie: "token=active; user_role=ADMIN" },
    }),
  );

  expect(response.headers.get("location")).toBe(
    "http://localhost/admin/k340eol21/orders",
  );
});
