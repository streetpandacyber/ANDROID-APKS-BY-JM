import { describe, expect, it } from "vitest";
import { balanceStock, buildReportSnapshot, calculateDashboardMetrics, hasDuplicateBarcode, calculateReceiptTotals, calculateSale, calculateShiftSummary, canAuthorizeAction, canAuthorizeSensitiveAction, filterReceipts, filterSales, filterStock, findProductByBarcode, isLowStock, isValidBackup, sortProducts, normalizeSale, hasDuplicateMpesaReceipt, reconcileMpesaSale, filterUnreconciledMpesa, filterReconciliationHistory, buildReconciliationExportRows, parseMpesaStatementCsv, matchMpesaStatementRows, inspectMpesaStatementCsv, suggestMpesaStatementMapping, detectMpesaMappingTemplate, buildMpesaMappingPreview, isWithinDateRange, mpesaStatementHeadersSignature, parseNotebookMarkdown } from "../lib/domain";
import { initialState, type Product } from "../lib/types";
import { decryptBackupPayload, encryptBackupPayload, isEncryptedBackup } from "../lib/backup-crypto";
import { formatEAT } from "../lib/time";

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

  it("uses inclusive EAT date boundaries and stable statement header signatures", () => {
    expect(isWithinDateRange("2026-08-27T00:30:00Z", "2026-08-27", "2026-08-27", value => value.slice(0, 10))).toBe(true);
    expect(isWithinDateRange("2026-08-28T00:00:00Z", "2026-08-27", "2026-08-27", value => value.slice(0, 10))).toBe(false);
    expect(mpesaStatementHeadersSignature([" Transaction Code ", "Amount (KSH)", "Phone Ref"])) .toBe("transactioncode|amountksh|phoneref");
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
    expect(canAuthorizeSensitiveAction({ ...base, action: "mpesa-reconcile", inputPin: "2468" })).toBe(true);
    expect(canAuthorizeSensitiveAction({ ...base, action: "mpesa-reconcile", inputPin: "1357" })).toBe(true);
    expect(canAuthorizeSensitiveAction({ ...base, action: "mpesa-reconcile", inputPin: "9999" })).toBe(false);
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

  it("builds dedicated report rows with inclusive date boundaries", () => {
    const shifts = [{ id: "shift-1", cashierName: "Amina", shiftName: "Morning", startedAt: "2026-08-20T08:00:00Z" }];
    const sales = [
      { id: "s1", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-20T09:00:00Z", items: [{ productId: "bread", name: "Bread", quantity: 2, quantityType: "unit" as const, unitPrice: 60, lineTotal: 120 }], subtotal: 120, discount: 0, refund: 10, total: 120, amountGiven: 200, change: 80 },
      { id: "s2", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-21T09:00:00Z", items: [{ productId: "rice", name: "Rice", quantity: 1, quantityType: "kg" as const, unitPrice: 1450, lineTotal: 1450 }], subtotal: 1450, discount: 0, refund: 0, total: 1450, amountGiven: 1500, change: 50 },
    ];
    const products = [{ ...initialState.products[0] }, { ...initialState.products[2] }];
    const daily = buildReportSnapshot("daily", sales, products, [], shifts, "2026-08-20", "2026-08-20");
    expect(daily.transactions).toBe(1);
    expect(daily.netSales).toBe(110);
    expect(daily.rows[0]).toMatchObject({ label: "2026-08-20", value: 110, count: 1 });
    expect(buildReportSnapshot("cashier", sales, products, [], shifts, "2026-08-20", "2026-08-21").rows[0].value).toBe(1560);
    expect(buildReportSnapshot("product", sales, products, [], shifts, "2026-08-20", "2026-08-21").rows[0].label).toBe("Rice");
    expect(buildReportSnapshot("stock", sales, products, [], shifts, "2026-08-20", "2026-08-21").rows[0].detail).toContain("balance");
    expect(buildReportSnapshot("shift", sales, products, [], shifts, "2026-08-20", "2026-08-21").rows[0].label).toBe("Morning");
  });

  it("sorts products and rejects duplicate barcodes", () => {
    const first = { ...initialState.products[0], id: "first", barcode: "616000000001" };
    const second = { ...initialState.products[1], id: "second", barcode: "616000000002", overallStock: 4, soldStock: 3, price: 900 };
    expect(sortProducts([first, second], "stockLow").map(item => item.id)).toEqual(["second", "first"]);
    expect(sortProducts([first, second], "priceHigh")[0].id).toBe("second");
    expect(hasDuplicateBarcode([first, second], "616000000001")).toBe(true);
    expect(hasDuplicateBarcode([first, second], "616000000001", "first")).toBe(false);
    expect(hasDuplicateBarcode([first, second], "")).toBe(false);
  });

  it("encrypts and validates password-protected backups", () => {
    const payload = { version: 1, state: initialState };
    const encrypted = encryptBackupPayload(payload, "correct horse", "2026-08-27T00:00:00.000Z");
    expect(isEncryptedBackup(encrypted)).toBe(true);
    expect(decryptBackupPayload(encrypted, "correct horse")).toEqual(payload);
    expect(() => decryptBackupPayload(encrypted, "wrong password")).toThrow("Incorrect backup password");
    expect(() => decryptBackupPayload(encrypted.slice(0, -4), "correct horse")).toThrow("Incorrect backup password");
    expect(() => encryptBackupPayload(payload, "short")).toThrow("at least 8 characters");
  });

  it("normalizes legacy sales and enforces manual M-Pesa reconciliation rules", () => {
    const legacy = normalizeSale({ id: "sale-1", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-27T08:00:00.000Z", items: [], subtotal: 100, discount: 0, refund: 0, total: 100, amountGiven: 100, change: 0 });
    expect(legacy.paymentMethod).toBe("cash");
    expect(legacy.reconciliationStatus).toBeUndefined();
    const mpesa = normalizeSale({ ...legacy, id: "sale-2", paymentMethod: "mpesa_manual", mpesaReceiptNumber: " qwe123 ", reconciliationStatus: undefined });
    expect(mpesa.reconciliationStatus).toBe("unreconciled");
    expect(hasDuplicateMpesaReceipt([mpesa], "QWE123")).toBe(true);
    expect(hasDuplicateMpesaReceipt([mpesa], "QWE123", "sale-2")).toBe(false);
    const reconciled = reconcileMpesaSale(mpesa, "Amina", "2026-08-27T09:00:00.000Z");
    expect(reconciled.reconciliationStatus).toBe("reconciled");
    expect(reconciled.reconciledBy).toBe("Amina");
    expect(() => reconcileMpesaSale(legacy, "Amina", "2026-08-27T09:00:00.000Z")).toThrow("manual M-Pesa");
  });

  it("filters unreconciled M-Pesa sales and builds their dedicated report", () => {
    const base = { shiftId: "shift-1", cashierName: "Amina", items: [{ productId: "bread", name: "Bread", quantity: 2, quantityType: "unit" as const, unitPrice: 60, lineTotal: 120 }], subtotal: 120, discount: 0, refund: 0, total: 120, amountGiven: 120, change: 0, paymentMethod: "mpesa_manual" as const, mpesaReceiptNumber: "ABC123" };
    const sales = [
      { ...base, id: "mpesa-open", createdAt: "2026-08-27T08:00:00Z", reconciliationStatus: "unreconciled" as const },
      { ...base, id: "mpesa-done", createdAt: "2026-08-27T09:00:00Z", mpesaReceiptNumber: "DONE123", reconciliationStatus: "reconciled" as const },
      { ...base, id: "cash", createdAt: "2026-08-27T10:00:00Z", paymentMethod: "cash" as const, mpesaReceiptNumber: undefined, reconciliationStatus: undefined },
      { ...base, id: "voided", createdAt: "2026-08-27T11:00:00Z", status: "voided" as const, reconciliationStatus: "unreconciled" as const },
    ];
    expect(filterUnreconciledMpesa(sales, "All", "2026-08-27", "2026-08-27")).toHaveLength(1);
    expect(filterUnreconciledMpesa(sales, "Brian")).toHaveLength(0);
    const report = buildReportSnapshot("mpesa-unreconciled", sales, [product], [], [], "2026-08-27", "2026-08-27");
    expect(report.title).toBe("Unreconciled M-Pesa report");
    expect(report.transactions).toBe(1);
    expect(report.netSales).toBe(120);
    expect(report.rows[0]).toMatchObject({ label: "ABC123", value: 120, count: 1 });
  });

  it("filters reconciliation history by cashier, date, and search text and builds export rows", () => {
    const sales = [{ id: "sale-1", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-27T08:00:00Z", items: [], subtotal: 500, discount: 0, refund: 0, total: 500, amountGiven: 500, change: 0, paymentMethod: "mpesa_manual" as const, mpesaReceiptNumber: "ABC123", mpesaPhone: "0712345678", reconciliationStatus: "reconciled" as const }];
    const entries = [{ id: "audit-1", type: "reconciliation" as const, action: "RECONCILE M-PESA ABC123", saleId: "sale-1", cashierName: "Amina", authorizedBy: "Owner", createdAt: "2026-08-27T09:00:00Z" }, { id: "audit-2", type: "reconciliation" as const, action: "RECONCILE M-PESA OTHER", saleId: "sale-2", cashierName: "Brian", authorizedBy: "Owner", createdAt: "2026-08-26T09:00:00Z" }];
    expect(filterReconciliationHistory(entries, sales, "Amina", "2026-08-27", "2026-08-27")).toHaveLength(1);
    expect(filterReconciliationHistory(entries, sales, "All", "", "", "ABC123")[0].id).toBe("audit-1");
    expect(buildReconciliationExportRows(entries, sales)[0]).toMatchObject({ receiptNumber: "ABC123", saleCashier: "Amina", authorizedBy: "Owner", amount: 500, status: "reconciled" });
  });

  it("parses and safely matches offline M-Pesa statement rows", () => {
    const sales = [{ id: "sale-1", shiftId: "shift-1", cashierName: "Amina", createdAt: "2026-08-27T08:00:00Z", items: [], subtotal: 500, discount: 0, refund: 0, total: 500, amountGiven: 500, change: 0, paymentMethod: "mpesa_manual" as const, mpesaReceiptNumber: "ABC123", mpesaPhone: "0712345678", reconciliationStatus: "unreconciled" as const }];
    const parsed = parseMpesaStatementCsv("Receipt,Amount,Phone\nabc123, KSH 500.00, +254712345678\nmissing,not-a-number,0712345678");
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.invalidRows).toEqual([3]);
    const result = matchMpesaStatementRows(parsed.rows, sales);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].sale.id).toBe("sale-1");
    expect(result.unmatched).toHaveLength(0);
    const wrongPhone = matchMpesaStatementRows([{ rowNumber: 2, confirmationCode: "ABC123", amount: 500, phone: "0799999999" }], sales);
    expect(wrongPhone.matches).toHaveLength(0);
    expect(wrongPhone.unmatched).toHaveLength(1);
  });

  it("supports custom CSV column mapping for alternate statement layouts", () => {
    const csv = "Narration,When,Value,Mobile,Ref\nPayment,27 Aug 2026 09:15, KSH 500.00,0712345678,abc123";
    const preview = inspectMpesaStatementCsv(csv);
    expect(preview.headers).toEqual(["Narration", "When", "Value", "Mobile", "Ref"]);
    const suggested = suggestMpesaStatementMapping(preview.headers);
    expect(suggested).toEqual({ confirmationCode: 4, amount: 2, phone: 3, occurredAt: 1 });
    const parsed = parseMpesaStatementCsv(csv, { confirmationCode: 4, amount: 2, phone: 3, occurredAt: 1 });
    expect(parsed.rows[0]).toMatchObject({ confirmationCode: "ABC123", amount: 500, phone: "0712345678", occurredAt: "27 Aug 2026 09:15" });
  });

  it("auto-detects saved mappings across reordered headers and preserves confidence", () => {
    const template = { id: "template-1", name: "Safaricom layout", headersSignature: mpesaStatementHeadersSignature(["Narration", "When", "Value", "Mobile", "Ref"]), headers: ["Narration", "When", "Value", "Mobile", "Ref"], mapping: { confirmationCode: 4, amount: 2, phone: 3, occurredAt: 1 }, createdAt: "2026-08-27T00:00:00Z" };
    const detection = detectMpesaMappingTemplate(["Ref", "Amount", "When", "Mobile", "Narration"], [template]);
    expect(detection).toMatchObject({ template, confidence: 1, exact: false, mapping: { confirmationCode: 0, amount: 1, phone: 3, occurredAt: 2 } });
    const partial = detectMpesaMappingTemplate(["Ref", "Amount", "Narration"], [{ ...template, headers: ["Ref", "Amount", "Narration"], headersSignature: mpesaStatementHeadersSignature(["Ref", "Amount", "Narration"]), mapping: { confirmationCode: 0, amount: 1, phone: -1, occurredAt: -1 } }]);
    expect(partial?.confidence).toBe(1);
  });

  it("builds a side-by-side mapping preview with field status and sample values", () => {
    const preview = buildMpesaMappingPreview(["Reference", "Amount", "Narration"], [["ABC123", "500", "Payment"]], { confirmationCode: 0, amount: 1, phone: -1, occurredAt: 4 });
    expect(preview).toMatchObject([{ label: "Confirmation code", columnName: "Reference", sample: "ABC123", status: "matched", required: true }, { label: "Amount", columnName: "Amount", sample: "500", status: "matched", required: true }, { label: "Phone reference", columnName: "Not used", status: "optional", required: false }, { label: "Statement date/time", columnName: "Not used", status: "optional", required: false }]);
  });

  it("flags invalid mapped samples and recalculates editable preview overrides", () => {
    const mapping = { confirmationCode: 0, amount: 1, phone: -1, occurredAt: -1 };
    expect(buildMpesaMappingPreview(["Reference", "Amount"], [["ABC123", "text"]], mapping).find(row => row.field === "amount")?.dataStatus).toBe("invalid");
    expect(buildMpesaMappingPreview(["Reference", "Amount"], [["ABC123", "500"]], mapping, { amount: "KES 1,250.00" }).find(row => row.field === "amount")?.dataStatus).toBe("valid");
  });

  it("applies configurable M-Pesa validation rules and restores original samples", () => {
    const csv = "Ref,Amount,Mobile,When\nABC123,500,0712345678,27 Aug 2026 09:15\nBAD,500,not-a-phone,not-a-date";
    const mapping = { confirmationCode: 0, amount: 1, phone: 2, occurredAt: 3 };
    const rules = { requirePositiveAmount: true, requirePhone: true, requireOccurredAt: true, phoneMinDigits: 9 };
    expect(parseMpesaStatementCsv(csv, mapping, rules)).toMatchObject({ rows: [{ confirmationCode: "ABC123", amount: 500 }], invalidRows: [3] });
    expect(buildMpesaMappingPreview(["Ref", "Amount", "Mobile", "When"], [["ABC123", "500", "0712345678", "27 Aug 2026 09:15"]], mapping, { amount: "text" }, rules).find(row => row.field === "amount")?.dataStatus).toBe("invalid");
    expect(buildMpesaMappingPreview(["Ref", "Amount"], [["ABC123", "500"]], { confirmationCode: 0, amount: 1, phone: -1, occurredAt: -1 }, { amount: "1,250" }).find(row => row.field === "amount")?.sample).toBe("1,250");
    expect(buildMpesaMappingPreview(["Ref", "Amount"], [["ABC123", "500"]], { confirmationCode: 0, amount: 1, phone: -1, occurredAt: -1 }).find(row => row.field === "amount")?.sample).toBe("500");
  });

  it("parses Notebook Markdown-style blocks deterministically", () => {
    expect(parseNotebookMarkdown("# Title\n\n**bold**\n• Task\n2. Next\n☐ Done\n---")).toEqual([{ kind: "heading", level: 1, value: "Title" }, { kind: "spacer", value: "" }, { kind: "text", value: "**bold**" }, { kind: "bullet", marker: "•", value: "Task" }, { kind: "numbered", marker: "2.", value: "Next" }, { kind: "task", marker: "□", value: "Done" }, { kind: "divider", value: "" }]);
  });

  it("formats known timestamps in East Africa Time", () => {
    expect(formatEAT("2026-08-27T00:00:00.000Z", "dateTime")).toContain("03:00:00");
    expect(formatEAT("2026-08-27T00:00:00.000Z", "date")).toContain("27");
  });

  it("accepts only compatible backup envelopes", () => {
    expect(isValidBackup({ version: 1, state: initialState })).toBe(true);
    expect(isValidBackup({ version: 1, state: { products: [] } })).toBe(false);
  });
});
