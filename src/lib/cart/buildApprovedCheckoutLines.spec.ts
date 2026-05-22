import { describe, expect, test } from "bun:test";
import {
  buildApprovedCheckoutLines,
  buildCartApprovedSummaryLines,
} from "./buildApprovedCheckoutLines";

describe("buildApprovedCheckoutLines", () => {
  test("does not duplicate approved resale cart line and its rental request", () => {
    const cartItems = [
      {
        id: "cart-line-1",
        productId: "prod-resale",
        days: 0,
        product: { listingType: "RESALE" },
      },
    ];

    const approvedRows = [
      {
        productId: "prod-resale",
        cartItemId: "cart-line-1",
        status: "approved",
        rentalDays: 0,
        totalPrice: 0,
        productDetail: { listingType: "RESALE", name: "TEST RESALE ITEM" },
      },
    ];

    const resaleCartLines = [
      {
        id: "cart-line-1",
        cartItemId: "cart-line-1",
        productId: "prod-resale",
        isResale: true,
        rentalDays: 0,
        totalPrice: 1000,
        productDetail: { listingType: "RESALE", name: "TEST RESALE ITEM" },
      },
    ];

    const lines = buildApprovedCheckoutLines(
      approvedRows,
      resaleCartLines,
      cartItems as never,
    );

    expect(lines).toHaveLength(1);
    expect(lines[0].totalPrice).toBe(1000);
  });

  test("includes cart resale line when status is lowercase approved", () => {
    const cartItems = [
      {
        id: "cart-line-1",
        productId: "prod-resale",
        days: 0,
        product: { listingType: "RESALE" },
      },
    ];

    const lines = buildCartApprovedSummaryLines(
      [],
      [
        {
          lineId: "cart-line-1",
          cartItemId: "cart-line-1",
          productId: "prod-resale",
          isResale: true,
          status: "approved",
          totalPrice: 1000,
        },
      ],
      cartItems as never,
    );

    expect(lines).toHaveLength(1);
    expect(lines[0].totalPrice).toBe(1000);
  });

  test("includes cart resale line when cart row is already approved", () => {
    const cartItems = [
      {
        id: "cart-line-1",
        productId: "prod-resale",
        days: 0,
        product: { listingType: "RESALE" },
      },
    ];

    const lines = buildApprovedCheckoutLines(
      [],
      [
        {
          lineId: "cart-line-1",
          cartItemId: "cart-line-1",
          productId: "prod-resale",
          isResale: true,
          status: "APPROVED",
          totalPrice: 1000,
        },
      ],
      cartItems as never,
    );

    expect(lines).toHaveLength(1);
    expect(lines[0].totalPrice).toBe(1000);
  });

  test("omits resale cart line without matching approved request", () => {
    const cartItems = [
      {
        id: "cart-line-1",
        productId: "prod-resale",
        days: 0,
        product: { listingType: "RESALE" },
      },
    ];

    const lines = buildApprovedCheckoutLines(
      [],
      [
        {
          id: "cart-line-1",
          cartItemId: "cart-line-1",
          productId: "prod-resale",
          isResale: true,
          totalPrice: 1000,
        },
      ],
      cartItems as never,
    );

    expect(lines).toHaveLength(0);
  });
});
