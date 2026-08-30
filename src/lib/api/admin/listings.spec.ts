import { beforeEach, describe, expect, mock, test } from "bun:test";

const apiFetchMock = mock(() =>
  Promise.resolve({ success: true, data: { id: "prod-1" } }),
);

mock.module("../http", () => ({
  apiFetch: apiFetchMock,
}));

const { productsApi } = await import("./listings");

describe("productsApi.setAvailability", () => {
  beforeEach(() => {
    apiFetchMock.mockClear();
  });

  test("PATCHes the product availability route with isAvailable payload", async () => {
    await productsApi.setAvailability("prod-1", false);

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect(apiFetchMock).toHaveBeenCalledWith("/product/prod-1/availability", {
      method: "PATCH",
      body: JSON.stringify({ isAvailable: false }),
      headers: { "Content-Type": "application/json" },
    });
  });

  test("does not call the removed admin-only availability route", async () => {
    await productsApi.setAvailability("prod-2", true);

    const [path] = apiFetchMock.mock.calls[0] ?? [];
    expect(path).not.toContain("/api/admin/products/");
    expect(path).toBe("/product/prod-2/availability");
  });
});
