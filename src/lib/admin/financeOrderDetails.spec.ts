import { describe, expect, test } from "bun:test";
import {
  buildFinanceOrdersHref,
  parseFinanceOrderDetails,
} from "./financeOrderDetails";

describe("finance order details", () => {
  test("builds an order drilldown with the inclusive finance date range", () => {
    expect(
      buildFinanceOrdersHref(
        "admin 1",
        "2026-10-01T00:00:00.000Z",
        "2026-11-01T00:00:00.000Z",
      ),
    ).toBe(
      "/admin/admin%201/orders?financeDetail=1&dateFrom=2026-10-01&dateTo=2026-10-31",
    );
  });

  test("reads valid finance date filters from the order page URL", () => {
    expect(
      parseFinanceOrderDetails(
        "?financeDetail=1&dateFrom=2026-10-01&dateTo=2026-10-31",
      ),
    ).toEqual({
      isFinanceContext: true,
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    });
  });

  test("ignores an invalid calendar date", () => {
    expect(
      parseFinanceOrderDetails(
        "?financeDetail=1&dateFrom=2026-02-31&dateTo=2026-03-01",
      ),
    ).toEqual({
      isFinanceContext: true,
      dateTo: "2026-03-01",
    });
  });

  test("ignores a reversed date range", () => {
    expect(
      parseFinanceOrderDetails(
        "?financeDetail=1&dateFrom=2026-10-31&dateTo=2026-10-01",
      ),
    ).toEqual({ isFinanceContext: true });
  });

  test("does not treat ordinary order URLs as finance drilldowns", () => {
    expect(parseFinanceOrderDetails("?dateFrom=2026-10-01")).toEqual({
      isFinanceContext: false,
    });
  });
});
