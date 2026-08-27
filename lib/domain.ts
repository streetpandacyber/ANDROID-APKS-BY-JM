import type { AppState, CartLine, Product, ReceiptEntry, Sale, Shift, StockAdjustment } from "./types";

export type StockFilter = "all" | "low" | "inStock";
export type DashboardMetrics = { netSales: number; itemsSold: number; transactions: number; lowStockCount: number };
export type SensitiveAction = "sale-edit" | "sale-delete" | "stock-adjust" | "report-change" | "refund" | "void";

type AuthorizationPolicyInput = {
  action: SensitiveAction;
  inputPin: string;
  appPin?: string;
  editPin?: string;
  cashierEditPin?: string;
  ownerPin?: string;
  ownerCashierPin?: string;
  editPinEnabled?: boolean;
};

export function calculateSale(cart: CartLine[], products: Product[], discount = 0, amountGiven = 0) {
  const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total, amountGiven, change: Math.max(0, amountGiven - total) };
}

export function calculateReceiptTotals(subtotal: number, discountValue = 0, discountMode: "amount" | "percent" = "amount", taxValue = 0, taxMode: "amount" | "percent" = "amount") {
  const rawDiscount = Math.max(0, discountValue || 0);
  const discount = discountMode === "percent" ? subtotal * Math.min(rawDiscount, 100) / 100 : rawDiscount;
  const afterDiscount = Math.max(0, subtotal - discount);
  const rawTax = Math.max(0, taxValue || 0);
  const tax = taxMode === "percent" ? afterDiscount * Math.min(rawTax, 100) / 100 : rawTax;
  return { subtotal, discount, tax, total: Math.max(0, afterDiscount + tax) };
}

export function balanceStock(product: Product) {
  return Math.max(0, product.overallStock - product.soldStock);
}

export function isLowStock(product: Product) {
  return balanceStock(product) <= product.lowStockThreshold;
}

export function filterSales(sales: Sale[], cashier = "All", from = "", to = "", dateKey: (value: string) => string = value => value.slice(0, 10)) { return sales.filter(sale => (cashier === "All" || sale.cashierName === cashier) && (!from || dateKey(sale.createdAt) >= from) && (!to || dateKey(sale.createdAt) <= to)); }

export function filterStock(products: Product[], adjustments: StockAdjustment[], status: StockFilter = "all", date = "", search = "", dateKey: (value: string) => string = value => value.slice(0, 10)) { const query = search.trim().toLowerCase(); return products.filter(product => { const balance = balanceStock(product); const statusMatch = status === "all" || (status === "low" ? balance <= product.lowStockThreshold : balance > product.lowStockThreshold); const dateMatch = !date || adjustments.some(move => move.productId === product.id && dateKey(move.createdAt) === date); const searchMatch = !query || `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query); return statusMatch && dateMatch && searchMatch; }); }

export function calculateDashboardMetrics(sales: Sale[], products: Product[], day = "", dateKey: (value: string) => string = value => value.slice(0, 10)): DashboardMetrics { const todaySales = day ? sales.filter(sale => dateKey(sale.createdAt) === day) : sales; const activeSales = todaySales.filter(sale => sale.status !== "voided"); return { netSales: activeSales.reduce((sum, sale) => sum + sale.total - (sale.refund || 0), 0), itemsSold: activeSales.reduce((sum, sale) => sum + sale.items.reduce((items, item) => items + item.quantity, 0), 0), transactions: activeSales.length, lowStockCount: products.filter(isLowStock).length }; }

export type ShiftSummary = { shiftId: string; shiftName: string; cashierName: string; startedAt: string; endedAt?: string; durationMinutes: number; transactions: number; itemsSold: number; grossSales: number; refunds: number; netSales: number; cashHandled: number; voidedTransactions: number };
export function calculateShiftSummary(shift: Shift, sales: Sale[], now = new Date().toISOString()): ShiftSummary { const shiftSales = sales.filter(sale => sale.shiftId === shift.id); const activeSales = shiftSales.filter(sale => sale.status !== "voided"); const grossSales = activeSales.reduce((sum, sale) => sum + sale.total, 0); const refunds = activeSales.reduce((sum, sale) => sum + (sale.refund || 0), 0); const end = shift.endedAt || now; return { shiftId: shift.id, shiftName: shift.shiftName || "Regular shift", cashierName: shift.cashierName, startedAt: shift.startedAt, endedAt: shift.endedAt, durationMinutes: Math.max(0, Math.round((new Date(end).getTime() - new Date(shift.startedAt).getTime()) / 60000)), transactions: activeSales.length, itemsSold: activeSales.reduce((sum, sale) => sum + sale.items.reduce((items, item) => items + item.quantity, 0), 0), grossSales, refunds, netSales: grossSales - refunds, cashHandled: activeSales.reduce((sum, sale) => sum + sale.amountGiven, 0), voidedTransactions: shiftSales.filter(sale => sale.status === "voided").length }; }

export type ReportType = "daily" | "cashier" | "product" | "stock" | "shift";
export type ReportRow = { label: string; detail: string; value: number; count: number };
export type ReportSnapshot = { type: ReportType; title: string; from: string; to: string; transactions: number; itemsSold: number; grossSales: number; refunds: number; netSales: number; cashHandled: number; rows: ReportRow[] };
export function buildReportSnapshot(type: ReportType, sales: Sale[], products: Product[], adjustments: StockAdjustment[], shifts: Shift[], from = "", to = "", dateKey: (value: string) => string = value => value.slice(0, 10), activeShiftId?: string): ReportSnapshot { const bounded = sales.filter(sale => (!from || dateKey(sale.createdAt) >= from) && (!to || dateKey(sale.createdAt) <= to) && (!activeShiftId || sale.shiftId === activeShiftId)); const active = bounded.filter(sale => sale.status !== "voided"); const rows = new Map<string, ReportRow>(); const add = (label: string, detail: string, value: number, count: number) => { const current = rows.get(label) || { label, detail, value: 0, count: 0 }; rows.set(label, { ...current, value: current.value + value, count: current.count + count }); }; if (type === "daily") active.forEach(sale => add(dateKey(sale.createdAt), sale.cashierName, sale.total - (sale.refund || 0), 1)); if (type === "cashier") active.forEach(sale => add(sale.cashierName, `${sale.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)`, sale.total - (sale.refund || 0), 1)); if (type === "product") active.flatMap(sale => sale.items).forEach(item => add(item.name, item.quantityType, item.lineTotal, item.quantity)); if (type === "stock") products.forEach(product => add(product.name, `${balanceStock(product)} balance`, balanceStock(product), adjustments.filter(move => move.productId === product.id && (!from || dateKey(move.createdAt) >= from) && (!to || dateKey(move.createdAt) <= to)).length)); if (type === "shift") shifts.filter(shift => !activeShiftId || shift.id === activeShiftId).forEach(shift => { const summary = calculateShiftSummary(shift, bounded); add(shift.shiftName || "Regular shift", summary.cashierName, summary.netSales, summary.transactions); }); const grossSales = active.reduce((sum, sale) => sum + sale.total, 0); const refunds = active.reduce((sum, sale) => sum + (sale.refund || 0), 0); return { type, title: `${type[0].toUpperCase()}${type.slice(1)} report`, from, to, transactions: active.length, itemsSold: active.reduce((sum, sale) => sum + sale.items.reduce((count, item) => count + item.quantity, 0), 0), grossSales, refunds, netSales: grossSales - refunds, cashHandled: active.reduce((sum, sale) => sum + sale.amountGiven, 0), rows: [...rows.values()].sort((a, b) => b.value - a.value) }; }

export function canAuthorizeAction(inputPin: string, appPin?: string, editPin?: string, cashierPin?: string) { return Boolean(inputPin) && [appPin, editPin, cashierPin].some(pin => Boolean(pin) && pin === inputPin); }

export function canAuthorizeSensitiveAction(input: AuthorizationPolicyInput) {
  if (!input.inputPin) return false;
  const ownerAuthorized = [input.ownerPin, input.ownerCashierPin].some(pin => Boolean(pin) && pin === input.inputPin);
  if (input.action === "refund" || input.action === "void" || input.action === "sale-delete") return ownerAuthorized;
  if (!input.editPinEnabled) return true;
  return ownerAuthorized || [input.editPin, input.cashierEditPin].some(pin => Boolean(pin) && pin === input.inputPin);
}

export function filterReceipts(receipts: ReceiptEntry[], search = "", date = "", amountFilter: "all" | "under1000" | "over1000" = "all", sort: "newest" | "oldest" | "amountHigh" | "amountLow" = "newest", dateKey: (value: string) => string = value => value.slice(0, 10)) { const query = search.trim().toLowerCase(); return receipts.filter(receipt => { const haystack = `${receipt.customerName} ${receipt.receiptNumber} ${receipt.title || ""} ${receipt.lines.map(line => line.description).join(" ")}`.toLowerCase(); const amount = receipt.thumbnail?.total ?? receipt.total; const amountMatch = amountFilter === "all" || (amountFilter === "under1000" ? amount < 1000 : amount >= 1000); return haystack.includes(query) && (!date || dateKey(receipt.date) === date) && amountMatch; }).sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : sort === "amountHigh" ? (b.thumbnail?.total ?? b.total) - (a.thumbnail?.total ?? a.total) : sort === "amountLow" ? (a.thumbnail?.total ?? a.total) - (b.thumbnail?.total ?? b.total) : b.date.localeCompare(a.date)); }

export type ProductSort = "name" | "stockLow" | "stockHigh" | "priceHigh";
export function sortProducts(products: Product[], sort: ProductSort = "name") { return [...products].sort((a, b) => sort === "stockLow" ? balanceStock(a) - balanceStock(b) : sort === "stockHigh" ? balanceStock(b) - balanceStock(a) : sort === "priceHigh" ? b.price - a.price : a.name.localeCompare(b.name)); }
export function hasDuplicateBarcode(products: Product[], barcode: string, excludeId?: string) { const normalized = barcode.trim(); return Boolean(normalized) && products.some(product => product.id !== excludeId && product.barcode?.trim() === normalized); }

export function findProductByBarcode(products: Product[], code: string) { const normalized = code.trim(); if (!normalized) return undefined; return products.find(product => product.barcode?.trim() === normalized || product.sku.trim() === normalized); }

export function normalizeSale(sale: Sale): Sale { const paymentMethod = sale.paymentMethod || "cash"; return { ...sale, paymentMethod, reconciliationStatus: paymentMethod === "mpesa_manual" ? sale.reconciliationStatus || "unreconciled" : undefined }; }
export function hasDuplicateMpesaReceipt(sales: Sale[], receiptNumber: string, excludeSaleId?: string) { const normalized = receiptNumber.trim().toUpperCase(); return Boolean(normalized) && sales.some(sale => sale.id !== excludeSaleId && sale.paymentMethod === "mpesa_manual" && sale.mpesaReceiptNumber?.trim().toUpperCase() === normalized); }
export function reconcileMpesaSale(sale: Sale, reconciledBy: string, reconciledAt: string): Sale { if (sale.paymentMethod !== "mpesa_manual") throw new Error("Only manual M-Pesa sales can be reconciled"); return { ...sale, reconciliationStatus: "reconciled", reconciledBy, reconciledAt }; }

export function isValidBackup(value: unknown): value is { version: number; state: AppState } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { version?: unknown; state?: AppState };
  return typeof candidate.version === "number" && Boolean(candidate.state?.products) && Boolean(candidate.state?.sales) && Boolean(candidate.state?.settings);
}
