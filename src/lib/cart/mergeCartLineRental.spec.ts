import { describe, expect, test } from "bun:test";
import {
  canShowInCartList,
  isActivePendingCartRental,
  isCartRentalMainListRow,
  rentalMetaFromCartApiItem,
  resolveRentalMetaForCartLine,
} from "./mergeCartLineRental";

describe("isActivePendingCartRental", () => {
  test("returns true for pending status without expiry", () => {
    expect(isActivePendingCartRental("PENDING")).toBe(true);
    expect(isActivePendingCartRental("pending_lister_approval")).toBe(true);
  });

  test("returns false for terminal statuses", () => {
    expect(isActivePendingCartRental("APPROVED")).toBe(false);
    expect(isActivePendingCartRental("REJECTED")).toBe(false);
    expect(isActivePendingCartRental("EXPIRED")).toBe(false);
  });

  test("returns false when pending but expiry is in the past", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isActivePendingCartRental("PENDING", past)).toBe(false);
  });

  test("returns true when pending and expiry is in the future", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isActivePendingCartRental("PENDING", future)).toBe(true);
  });
});

describe("isCartRentalMainListRow", () => {
  test("includes approved rentals", () => {
    expect(isCartRentalMainListRow("APPROVED")).toBe(true);
    expect(isCartRentalMainListRow("ACCEPTED")).toBe(true);
  });

  test("excludes ordered or processing rows", () => {
    expect(isCartRentalMainListRow("ORDERED")).toBe(false);
    expect(isCartRentalMainListRow("PROCESSING")).toBe(false);
  });
});

describe("canShowInCartList", () => {
  test("shows approved lines", () => {
    expect(canShowInCartList("approved")).toBe(true);
  });

  test("hides cancelled lines", () => {
    expect(canShowInCartList("CANCELLED")).toBe(false);
  });
});

describe("rentalMetaFromCartApiItem", () => {
  test("reads nested rentalRequest object", () => {
    const meta = rentalMetaFromCartApiItem({
      id: "line-1",
      productId: "prod-1",
      rentalRequest: {
        requestId: "req-1",
        status: "PENDING",
        expiresAt: "2026-12-01T00:00:00.000Z",
      },
    } as never);

    expect(meta).toEqual({
      rentalRequestId: "req-1",
      status: "PENDING",
      expiresAt: "2026-12-01T00:00:00.000Z",
    });
  });

  test("reads snake_case rental_request fields", () => {
    const meta = rentalMetaFromCartApiItem({
      id: "line-1",
      productId: "prod-1",
      rental_request: {
        request_id: "req-snake",
        rental_status: "APPROVED",
      },
    } as never);

    expect(meta).toEqual({
      rentalRequestId: "req-snake",
      status: "APPROVED",
    });
  });

  test("returns null when no rental metadata is present", () => {
    expect(
      rentalMetaFromCartApiItem({ id: "line-1", productId: "prod-1" } as never),
    ).toBeNull();
  });
});

describe("resolveRentalMetaForCartLine", () => {
  test("prefers rental list row matching embedded request id", () => {
    const meta = resolveRentalMetaForCartLine(
      "cart-line-1",
      "prod-1",
      { rentalRequestId: "req-1", status: "PENDING" },
      [
        {
          requestId: "req-1",
          productId: "prod-1",
          cartItemId: "cart-line-1",
          status: "APPROVED",
          expiresAt: "2026-12-01T00:00:00.000Z",
        },
      ],
    );

    expect(meta).toEqual({
      rentalRequestId: "req-1",
      status: "APPROVED",
      expiresAt: "2026-12-01T00:00:00.000Z",
    });
  });

  test("falls back to cart line and product match when embedded id is missing", () => {
    const meta = resolveRentalMetaForCartLine("cart-line-2", "prod-2", null, [
      {
        requestId: "req-2",
        productId: "prod-2",
        cartItemId: "cart-line-2",
        status: "PENDING",
      },
    ]);

    expect(meta).toEqual({
      rentalRequestId: "req-2",
      status: "PENDING",
    });
  });
});
