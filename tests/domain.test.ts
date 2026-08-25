import { describe, expect, it } from "vitest";
import { balanceStock, calculateSale, isLowStock, isValidBackup } from "../lib/domain";
import { initialState, type Product } from "../lib/types";

const product: Product = { ...initialState.products[0], overallStock: 10, soldStock: 3, lowStockThreshold: 7 };

describe("offline business rules", () => {
  it("calculates subtotal, discount, and change", () => {
    expect(calculateSale([{ productId: "bread", quantity: 2, unitPrice: 60 }], [product], 10, 200)).toEqual({ subtotal: 120, total: 110, amountGiven: 200, change: 90 });
  });

  it("tracks stock balance and low-stock status", () => {
    expect(balanceStock(product)).toBe(7);
    expect(isLowStock(product)).toBe(true);
  });

  it("accepts only compatible backup envelopes", () => {
    expect(isValidBackup({ version: 1, state: initialState })).toBe(true);
    expect(isValidBackup({ version: 1, state: { products: [] } })).toBe(false);
  });
});
