import { describe, expect, test } from "bun:test";
import {
  checkoutLineCartDays,
  checkoutLineListingType,
  findCartLineForCheckoutItem,
  isCheckoutRentalLine,
  isCheckoutResalePurchaseLine,
  isPurchaseOnlyCheckout,
} from "./checkoutLineKind";
import type { CartItem } from "@/lib/api/cart";

const cartItems: CartItem[] = [
  {
    id: "cart-1",
    days: 0,
    product: { listingType: "RESALE" },
  } as CartItem,
  {
    id: "cart-2",
    days: 7,
    product: { listingType: "RENT_OR_RESALE" },
  } as CartItem,
  {
    id: "cart-3",
    days: 3,
    product: { listingType: "RENTAL" },
  } as CartItem,
];

describe("findCartLineForCheckoutItem", () => {
  test("matches by cartItemId", () => {
    expect(
      findCartLineForCheckoutItem({ cartItemId: "cart-2" }, cartItems)?.id,
    ).toBe("cart-2");
  });

  test("returns undefined for missing id", () => {
    expect(findCartLineForCheckoutItem({}, cartItems)).toBeUndefined();
  });
});

describe("checkoutLineCartDays", () => {
  test("prefers cart days over stale request rentalDays", () => {
    const cartLine = cartItems[1];
    expect(checkoutLineCartDays({ rentalDays: 0 }, cartLine)).toBe(7);
  });
});

describe("checkoutLineListingType", () => {
  test("prefers cart product listing type", () => {
    expect(
      checkoutLineListingType(
        { productDetail: { listingType: "RENTAL" } },
        cartItems[0],
      ),
    ).toBe("RESALE");
  });
});

describe("isCheckoutResalePurchaseLine", () => {
  test("detects explicit resale flag", () => {
    expect(isCheckoutResalePurchaseLine({ isResale: true }, cartItems)).toBe(
      true,
    );
  });

  test("detects RESALE listing type", () => {
    expect(
      isCheckoutResalePurchaseLine({ cartItemId: "cart-1" }, cartItems),
    ).toBe(true);
  });

  test("detects RENT_OR_RESALE with zero rental days", () => {
    expect(
      isCheckoutResalePurchaseLine(
        { cartItemId: "cart-2", rentalDays: 7 },
        [{ ...cartItems[1], days: 0 } as CartItem],
      ),
    ).toBe(true);
  });
});

describe("isPurchaseOnlyCheckout", () => {
  test("returns true when approved lines are all purchase/resale", () => {
    expect(
      isPurchaseOnlyCheckout(
        [{ cartItemId: "cart-1", rentalDays: 0 }],
        cartItems,
      ),
    ).toBe(true);
  });

  test("stays true when cart also holds unapproved rental lines", () => {
    const cartWithExtraRental = [
      ...cartItems,
      {
        id: "cart-4",
        days: 5,
        product: { listingType: "RENTAL" },
      } as CartItem,
    ];
    expect(
      isPurchaseOnlyCheckout(
        [{ cartItemId: "cart-1", rentalDays: 0 }],
        cartWithExtraRental,
      ),
    ).toBe(true);
  });

  test("returns false when approved checkout includes a rental line", () => {
    expect(
      isPurchaseOnlyCheckout([{ cartItemId: "cart-3" }], cartItems),
    ).toBe(false);
  });
});

describe("isCheckoutRentalLine", () => {
  test("returns true for rental with days > 0", () => {
    expect(
      isCheckoutRentalLine({ cartItemId: "cart-3" }, cartItems),
    ).toBe(true);
  });

  test("returns false for resale purchase lines", () => {
    expect(
      isCheckoutRentalLine({ cartItemId: "cart-1" }, cartItems),
    ).toBe(false);
  });
});
