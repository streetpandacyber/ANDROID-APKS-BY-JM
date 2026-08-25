import { describe, expect, it } from "vitest";
import { balanceStock, calculateReceiptTotals, calculateSale, canAuthorizeAction, filterSales, isLowStock, isValidBackup } from "../lib/domain";
import { initialState, type Product } from "../lib/types";

const product: Product = { ...initialState.products[0], overallStock: 10, soldStock: 3, lowStockThreshold: 7 };

describe("offline business rules", () => {
  it("calculates subtotal, discount, and change", () => {
    expect(calculateSale([{ productId: "bread", quantity: 2, unitPrice: 60 }], [product], 10, 200)).toEqual({ subtotal: 120, total: 110, amountGiven: 200, change: 90 });
  });

  it("calculates percentage discount before percentage tax", () => {
    expect(calculateReceiptTotals(1000, 10, "percent", 16, "percent")).toEqual({ subtotal: 1000, discount: 100, tax: 144, total: 1044 });
  });

  it("calculates fixed receipt discount and tax", () => {
    expect(calculateReceiptTotals(1000, 100, "amount", 50, "amount")).toEqual({ subtotal: 1000, discount: 100, tax: 50, total: 950 });
  });

  it("tracks stock balance and low-stock status", () => {
    expect(balanceStock(product)).toBe(7);
    expect(isLowStock(product)).toBe(true);
  });

  it("filters sales by cashier and date range", () => {
    const sales = [
      { id: "a", shiftId: "s", cashierName: "Amina", createdAt: "2026-08-20T10:00:00Z", items: [], subtotal: 100, discount: 0, refund: 0, total: 100, amountGiven: 100, change: 0 },
      { id: "b", shiftId: "s", cashierName: "Brian", createdAt: "2026-08-22T10:00:00Z", items: [], subtotal: 200, discount: 0, refund: 0, total: 200, amountGiven: 200, change: 0 },
    ];
    expect(filterSales(sales, "Amina", "2026-08-20", "2026-08-20")).toHaveLength(1);
    expect(filterSales(sales, "All", "2026-08-21", "2026-08-23")[0].cashierName).toBe("Brian");
  });

  it("accepts app, edit, or cashier PINs for protected actions", () => {
    expect(canAuthorizeAction("2468", "1357", "2468")).toBe(true);
    expect(canAuthorizeAction("9999", "1357", "2468", "1111")).toBe(false);
  });

  it("accepts only compatible backup envelopes", () => {
    expect(isValidBackup({ version: 1, state: initialState })).toBe(true);
    expect(isValidBackup({ version: 1, state: { products: [] } })).toBe(false);
  });
});
