import { describe, expect, test } from "bun:test";
import {
  checkoutLineCartDays,
  checkoutLineListingType,
  findCartLineForCheckoutItem,
  isCheckoutRentalLine,
  isCheckoutResalePurchaseLine,
  isCartPurchaseResaleOnly,
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

  test("detects purchase when cart days are zero but listingType is missing", () => {
    const cartWithoutListingType = [
      { id: "cart-purchase", days: 0, product: {} },
    ] as CartItem[];
    expect(
      isCheckoutResalePurchaseLine(
        { cartItemId: "cart-purchase" },
        cartWithoutListingType,
      ),
    ).toBe(true);
  });
});

describe("isCartPurchaseResaleOnly", () => {
  test("returns true when every cart line is purchase/resale", () => {
    expect(isCartPurchaseResaleOnly([cartItems[0]])).toBe(true);
  });

  test("returns false when the cart includes a rental line", () => {
    expect(isCartPurchaseResaleOnly(cartItems)).toBe(false);
  });

  test("returns false for an empty cart", () => {
    expect(isCartPurchaseResaleOnly([])).toBe(false);
  });

  test("returns true when all lines have days zero even without listingType", () => {
    expect(
      isCartPurchaseResaleOnly([
        { id: "cart-purchase", days: 0, product: {} },
      ] as CartItem[]),
    ).toBe(true);
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
