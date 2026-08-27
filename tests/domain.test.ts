import { describe, expect, it } from "vitest";
import { balanceStock, calculateDashboardMetrics, calculateReceiptTotals, calculateSale, calculateShiftSummary, canAuthorizeAction, canAuthorizeSensitiveAction, filterReceipts, filterSales, filterStock, findProductByBarcode, isLowStock, isValidBackup } from "../lib/domain";
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

  it("calculates today dashboard metrics while excluding voided sales", () => {
    const sales = [
      { id: "a", shiftId: "s", cashierName: "Amina", createdAt: "2026-08-20T10:00:00Z", items: [{ productId: "bread", name: "Bread", quantity: 2, quantityType: "unit" as const, unitPrice: 60, lineTotal: 120 }], subtotal: 120, discount: 0, refund: 0, total: 120, amountGiven: 200, change: 80 },
      { id: "b", shiftId: "s", cashierName: "Brian", createdAt: "2026-08-20T11:00:00Z", items: [{ productId: "milk", name: "Milk", quantity: 1, quantityType: "liter" as const, unitPrice: 80, lineTotal: 80 }], subtotal: 80, discount: 0, refund: 0, total: 80, amountGiven: 80, change: 0, status: "voided" as const },
      { id: "c", shiftId: "s", cashierName: "Amina", createdAt: "2026-08-19T11:00:00Z", items: [{ productId: "rice", name: "Rice", quantity: 5, quantityType: "kg" as const, unitPrice: 10, lineTotal: 50 }], subtotal: 50, discount: 0, refund: 10, total: 50, amountGiven: 50, change: 0 },
    ];
    expect(calculateDashboardMetrics(sales, [product], "2026-08-20")).toEqual({ netSales: 120, itemsSold: 2, transactions: 1, lowStockCount: 1 });
  });

  it("filters sales by cashier and date range with a supplied date key", () => {
    const sales = [
      { id: "a", shiftId: "s", cashierName: "Amina", createdAt: "2026-08-20T10:00:00Z", items: [], subtotal: 100, discount: 0, refund: 0, total: 100, amountGiven: 100, change: 0 },
      { id: "b", shiftId: "s", cashierName: "Brian", createdAt: "2026-08-22T10:00:00Z", items: [], subtotal: 200, discount: 0, refund: 0, total: 200, amountGiven: 200, change: 0 },
    ];
    expect(filterSales(sales, "Amina", "2026-08-20", "2026-08-20")).toHaveLength(1);
    expect(filterSales(sales, "All", "2026-08-21", "2026-08-23")[0].cashierName).toBe("Brian");
    expect(filterSales(sales, "All", "2026-08-20", "2026-08-20", () => "2026-08-21")).toHaveLength(0);
  });

  it("filters stock by status, movement date, and search text", () => {
    const healthy = { ...initialState.products[1], id: "milk", name: "Fresh Milk", sku: "MLK-002", category: "Dairy", overallStock: 12, soldStock: 2, lowStockThreshold: 3 };
    const movements = [{ id: "m1", productId: "bread", quantity: 4, type: "restock" as const, createdAt: "2026-08-20T08:00:00Z", createdBy: "Amina" }, { id: "m2", productId: "milk", quantity: 2, type: "restock" as const, createdAt: "2026-08-21T08:00:00Z", createdBy: "Amina" }];
    expect(filterStock([product, healthy], movements, "low")).toEqual([product]);
    expect(filterStock([product, healthy], movements, "all", "2026-08-21", "milk")).toEqual([healthy]);
    expect(filterStock([product, healthy], movements, "inStock", "", "dairy")).toEqual([healthy]);
  });

  it("accepts app, edit, or cashier PINs for protected actions", () => {
    expect(canAuthorizeAction("2468", "1357", "2468")).toBe(true);
    expect(canAuthorizeAction("9999", "1357", "2468", "1111")).toBe(false);
  });

  it("summarizes a cashier shift without counting voided transactions", () => {
    const shift = { id: "shift-1", cashierName: "Amina", shiftName: "Morning", startedAt: "2026-08-20T08:00:00Z" };
    const sales = [
      { id: "s1", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-20T09:00:00Z", items: [{ productId: "bread", name: "Bread", quantity: 2, quantityType: "unit" as const, unitPrice: 60, lineTotal: 120 }], subtotal: 120, discount: 0, refund: 10, total: 120, amountGiven: 200, change: 80 },
      { id: "s2", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-20T10:00:00Z", items: [{ productId: "milk", name: "Milk", quantity: 1, quantityType: "liter" as const, unitPrice: 80, lineTotal: 80 }], subtotal: 80, discount: 0, refund: 0, total: 80, amountGiven: 80, change: 0, status: "voided" as const },
    ];
    expect(calculateShiftSummary(shift, sales, "2026-08-20T11:30:00Z")).toMatchObject({ shiftName: "Morning", transactions: 1, itemsSold: 2, grossSales: 120, refunds: 10, netSales: 110, cashHandled: 200, voidedTransactions: 1, durationMinutes: 210 });
  });

  it("enforces the sensitive-action authorization matrix", () => {
    const base = { inputPin: "2468", appPin: "1357", editPin: "2468", ownerPin: "1357", editPinEnabled: true };
    expect(canAuthorizeSensitiveAction({ ...base, action: "stock-adjust" })).toBe(true);
    expect(canAuthorizeSensitiveAction({ ...base, action: "report-change" })).toBe(true);
    expect(canAuthorizeSensitiveAction({ ...base, action: "stock-adjust", inputPin: "9999" })).toBe(false);
    expect(canAuthorizeSensitiveAction({ ...base, action: "refund", inputPin: "2468" })).toBe(false);
    expect(canAuthorizeSensitiveAction({ ...base, action: "void", inputPin: "1357" })).toBe(true);
    expect(canAuthorizeSensitiveAction({ ...base, action: "sale-delete", inputPin: "2468" })).toBe(false);
    expect(canAuthorizeSensitiveAction({ ...base, action: "sale-delete", inputPin: "1357" })).toBe(true);
    expect(canAuthorizeSensitiveAction({ ...base, action: "sale-edit", inputPin: "2468", editPinEnabled: false })).toBe(true);
  });

  it("matches products by barcode or SKU for offline scanning", () => {
    const coded = { ...product, barcode: "6161234567890", sku: "BRD-001" };
    expect(findProductByBarcode([coded], "6161234567890")?.id).toBe(coded.id);
    expect(findProductByBarcode([coded], "BRD-001")?.id).toBe(coded.id);
    expect(findProductByBarcode([coded], "unknown")).toBeUndefined();
  });

  it("filters and sorts receipt history deterministically", () => {
    const receipts = [
      { id: "r1", receiptNumber: "R-0001", customerName: "Amina", merchantName: "Shop", date: "2026-08-20T10:00:00Z", lines: [{ description: "Bread", quantity: 1, unitPrice: 60, amount: 60 }], total: 60, source: "manual" as const, images: [] },
      { id: "r2", receiptNumber: "R-0002", customerName: "Brian", merchantName: "Shop", date: "2026-08-22T10:00:00Z", lines: [{ description: "Rice", quantity: 1, unitPrice: 1450, amount: 1450 }], total: 1450, source: "manual" as const, images: [] },
    ];
    expect(filterReceipts(receipts, "amina")[0].id).toBe("r1");
    expect(filterReceipts(receipts, "", "2026-08-22")[0].id).toBe("r2");
    expect(filterReceipts(receipts, "", "", "over1000")[0].id).toBe("r2");
    expect(filterReceipts(receipts, "", "", "all", "oldest").map(receipt => receipt.id)).toEqual(["r1", "r2"]);
    expect(filterReceipts(receipts, "", "", "all", "amountHigh")[0].id).toBe("r2");
  });

  it("accepts only compatible backup envelopes", () => {
    expect(isValidBackup({ version: 1, state: initialState })).toBe(true);
    expect(isValidBackup({ version: 1, state: { products: [] } })).toBe(false);
  });
});
