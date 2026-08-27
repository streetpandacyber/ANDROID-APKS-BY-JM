import type { AppState, AuditEntry, CartLine, MpesaMappingTemplate, Product, ReceiptEntry, Sale, Shift, StockAdjustment } from "./types";

export type StockFilter = "all" | "low" | "inStock";
export type DashboardMetrics = { netSales: number; itemsSold: number; transactions: number; lowStockCount: number };
export type SensitiveAction = "sale-edit" | "sale-delete" | "stock-adjust" | "report-change" | "mpesa-reconcile" | "refund" | "void";

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

export function isWithinDateRange(value: string, from = "", to = "", dateKey: (value: string) => string = value => value.slice(0, 10)) { const day = dateKey(value); return (!from || day >= from) && (!to || day <= to); }
export function filterSales(sales: Sale[], cashier = "All", from = "", to = "", dateKey: (value: string) => string = value => value.slice(0, 10)) { return sales.filter(sale => (cashier === "All" || sale.cashierName === cashier) && isWithinDateRange(sale.createdAt, from, to, dateKey)); }

export function filterStock(products: Product[], adjustments: StockAdjustment[], status: StockFilter = "all", date = "", search = "", dateKey: (value: string) => string = value => value.slice(0, 10)) { const query = search.trim().toLowerCase(); return products.filter(product => { const balance = balanceStock(product); const statusMatch = status === "all" || (status === "low" ? balance <= product.lowStockThreshold : balance > product.lowStockThreshold); const dateMatch = !date || adjustments.some(move => move.productId === product.id && dateKey(move.createdAt) === date); const searchMatch = !query || `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query); return statusMatch && dateMatch && searchMatch; }); }

export function calculateDashboardMetrics(sales: Sale[], products: Product[], day = "", dateKey: (value: string) => string = value => value.slice(0, 10)): DashboardMetrics { const todaySales = day ? sales.filter(sale => dateKey(sale.createdAt) === day) : sales; const activeSales = todaySales.filter(sale => sale.status !== "voided"); return { netSales: activeSales.reduce((sum, sale) => sum + sale.total - (sale.refund || 0), 0), itemsSold: activeSales.reduce((sum, sale) => sum + sale.items.reduce((items, item) => items + item.quantity, 0), 0), transactions: activeSales.length, lowStockCount: products.filter(isLowStock).length }; }

export type ShiftSummary = { shiftId: string; shiftName: string; cashierName: string; startedAt: string; endedAt?: string; durationMinutes: number; transactions: number; itemsSold: number; grossSales: number; refunds: number; netSales: number; cashHandled: number; voidedTransactions: number };
export function calculateShiftSummary(shift: Shift, sales: Sale[], now = new Date().toISOString()): ShiftSummary { const shiftSales = sales.filter(sale => sale.shiftId === shift.id); const activeSales = shiftSales.filter(sale => sale.status !== "voided"); const grossSales = activeSales.reduce((sum, sale) => sum + sale.total, 0); const refunds = activeSales.reduce((sum, sale) => sum + (sale.refund || 0), 0); const end = shift.endedAt || now; return { shiftId: shift.id, shiftName: shift.shiftName || "Regular shift", cashierName: shift.cashierName, startedAt: shift.startedAt, endedAt: shift.endedAt, durationMinutes: Math.max(0, Math.round((new Date(end).getTime() - new Date(shift.startedAt).getTime()) / 60000)), transactions: activeSales.length, itemsSold: activeSales.reduce((sum, sale) => sum + sale.items.reduce((items, item) => items + item.quantity, 0), 0), grossSales, refunds, netSales: grossSales - refunds, cashHandled: activeSales.reduce((sum, sale) => sum + sale.amountGiven, 0), voidedTransactions: shiftSales.filter(sale => sale.status === "voided").length }; }

export type ReportType = "daily" | "cashier" | "product" | "stock" | "shift" | "mpesa-unreconciled";
export function filterUnreconciledMpesa(sales: Sale[], cashier = "All", from = "", to = "", dateKey: (value: string) => string = value => value.slice(0, 10)) { return filterSales(sales, cashier, from, to, dateKey).filter(sale => sale.status !== "voided" && sale.paymentMethod === "mpesa_manual" && sale.reconciliationStatus !== "reconciled"); }
export type ReportRow = { label: string; detail: string; value: number; count: number };
export type ReportSnapshot = { type: ReportType; title: string; from: string; to: string; transactions: number; itemsSold: number; grossSales: number; refunds: number; netSales: number; cashHandled: number; rows: ReportRow[] };
export function buildReportSnapshot(type: ReportType, sales: Sale[], products: Product[], adjustments: StockAdjustment[], shifts: Shift[], from = "", to = "", dateKey: (value: string) => string = value => value.slice(0, 10), activeShiftId?: string): ReportSnapshot { const bounded = sales.filter(sale => (!from || dateKey(sale.createdAt) >= from) && (!to || dateKey(sale.createdAt) <= to) && (!activeShiftId || sale.shiftId === activeShiftId)); const active = bounded.filter(sale => sale.status !== "voided"); const reportActive = type === "mpesa-unreconciled" ? active.filter(sale => sale.paymentMethod === "mpesa_manual" && sale.reconciliationStatus !== "reconciled") : active; const rows = new Map<string, ReportRow>(); const add = (label: string, detail: string, value: number, count: number) => { const current = rows.get(label) || { label, detail, value: 0, count: 0 }; rows.set(label, { ...current, value: current.value + value, count: current.count + count }); }; if (type === "daily") active.forEach(sale => add(dateKey(sale.createdAt), sale.cashierName, sale.total - (sale.refund || 0), 1)); if (type === "cashier") active.forEach(sale => add(sale.cashierName, `${sale.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)`, sale.total - (sale.refund || 0), 1)); if (type === "product") active.flatMap(sale => sale.items).forEach(item => add(item.name, item.quantityType, item.lineTotal, item.quantity)); if (type === "stock") products.forEach(product => add(product.name, `${balanceStock(product)} balance`, balanceStock(product), adjustments.filter(move => move.productId === product.id && (!from || dateKey(move.createdAt) >= from) && (!to || dateKey(move.createdAt) <= to)).length)); if (type === "shift") shifts.filter(shift => !activeShiftId || shift.id === activeShiftId).forEach(shift => { const summary = calculateShiftSummary(shift, bounded); add(shift.shiftName || "Regular shift", summary.cashierName, summary.netSales, summary.transactions); }); if (type === "mpesa-unreconciled") reportActive.forEach(sale => add(sale.mpesaReceiptNumber || sale.id, `${sale.cashierName} • ${dateKey(sale.createdAt)}`, sale.total - (sale.refund || 0), 1)); const grossSales = reportActive.reduce((sum, sale) => sum + sale.total, 0); const refunds = reportActive.reduce((sum, sale) => sum + (sale.refund || 0), 0); const title = type === "mpesa-unreconciled" ? "Unreconciled M-Pesa report" : `${type[0].toUpperCase()}${type.slice(1)} report`; return { type, title, from, to, transactions: reportActive.length, itemsSold: reportActive.reduce((sum, sale) => sum + sale.items.reduce((count, item) => count + item.quantity, 0), 0), grossSales, refunds, netSales: grossSales - refunds, cashHandled: reportActive.reduce((sum, sale) => sum + sale.amountGiven, 0), rows: [...rows.values()].sort((a, b) => b.value - a.value) }; }

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

export type ReconciliationHistoryFilter = { cashier?: string; from?: string; to?: string; search?: string };
function reconciliationSale(entry: AuditEntry, sales: Sale[]) { return entry.saleId ? sales.find(sale => sale.id === entry.saleId) : undefined; }
function reconciliationCashier(entry: AuditEntry, sale?: Sale) { return entry.cashierName || sale?.cashierName || entry.authorizedBy || "Owner"; }
export function filterReconciliationHistory(entries: AuditEntry[], sales: Sale[], cashier = "All", from = "", to = "", search = "", dateKey: (value: string) => string = value => value.slice(0, 10)) {
  const query = search.trim().toLowerCase();
  return entries.filter(entry => {
    if (entry.type !== "reconciliation") return false;
    const sale = reconciliationSale(entry, sales);
    const recordCashier = reconciliationCashier(entry, sale);
    const haystack = `${entry.action} ${entry.saleId || ""} ${sale?.mpesaReceiptNumber || ""} ${sale?.mpesaPhone || ""} ${sale?.cashierName || ""} ${recordCashier} ${entry.authorizedBy || ""}`.toLowerCase();
    return (cashier === "All" || recordCashier === cashier || sale?.cashierName === cashier || entry.authorizedBy === cashier) && isWithinDateRange(entry.createdAt, from, to, dateKey) && (!query || haystack.includes(query));
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type ReconciliationExportRow = { reconciledAt: string; transactionAt?: string; transactionDate: string; receiptNumber: string; saleId: string; saleCashier: string; recordedBy: string; authorizedBy: string; amount: number; phone: string; status: "reconciled" };
export function buildReconciliationExportRows(entries: AuditEntry[], sales: Sale[], dateKey: (value: string) => string = value => value.slice(0, 10)): ReconciliationExportRow[] {
  return entries.filter(entry => entry.type === "reconciliation").map(entry => {
    const sale = reconciliationSale(entry, sales);
    return { reconciledAt: entry.createdAt, transactionAt: sale?.createdAt, transactionDate: sale ? dateKey(sale.createdAt) : "", receiptNumber: sale?.mpesaReceiptNumber || entry.action.replace("RECONCILE M-PESA ", ""), saleId: entry.saleId || "", saleCashier: sale?.cashierName || "", recordedBy: entry.cashierName || "Owner", authorizedBy: entry.authorizedBy || entry.cashierName || "Owner", amount: sale?.total ?? 0, phone: sale?.mpesaPhone || "", status: "reconciled" as const };
  }).sort((a, b) => b.reconciledAt.localeCompare(a.reconciledAt));
}

export type MpesaStatementRow = { rowNumber: number; confirmationCode: string; amount: number; phone?: string; occurredAt?: string };
export type MpesaStatementMatch = { row: MpesaStatementRow; sale: Sale };
export type MpesaStatementParseResult = { rows: MpesaStatementRow[]; invalidRows: number[] };
export type MpesaStatementColumnMapping = { confirmationCode: number; amount: number; phone: number; occurredAt: number };
export type MpesaStatementCsvPreview = { headers: string[]; rows: string[][] };
export function inspectMpesaStatementCsv(csv: string): MpesaStatementCsvPreview { const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim()); return { headers: lines.length ? parseCsvLine(lines[0]) : [], rows: lines.slice(1, 4).map(parseCsvLine) }; }
function findStatementColumn(headers: string[], candidates: string[]) { return headers.map(normalizeCsvHeader).findIndex(header => candidates.some(candidate => header.includes(candidate))); }
export function suggestMpesaStatementMapping(headers: string[]): MpesaStatementColumnMapping { return { confirmationCode: findStatementColumn(headers, ["confirmationcode", "receipt", "transactioncode", "transactionid", "mpesacode", "reference", "ref"]), amount: findStatementColumn(headers, ["amount", "paid", "credit", "value"]), phone: findStatementColumn(headers, ["phone", "mobile", "msisdn", "phonereference"]), occurredAt: findStatementColumn(headers, ["datetime", "timestamp", "date", "time", "when"]) }; }
export type MpesaStatementMatchResult = { matches: MpesaStatementMatch[]; unmatched: MpesaStatementRow[]; duplicateRows: MpesaStatementRow[] };
function normalizeCsvHeader(value: string) { return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[^a-z0-9]/g, ""); }
export function mpesaStatementHeadersSignature(headers: string[]) { return headers.map(normalizeCsvHeader).join("|"); }
export type MpesaMappingTemplateDetection = { template: MpesaMappingTemplate; mapping: MpesaStatementColumnMapping; confidence: number; exact: boolean };
export function detectMpesaMappingTemplate(headers: string[], templates: MpesaMappingTemplate[]): MpesaMappingTemplateDetection | undefined {
  const normalizedHeaders = headers.map(normalizeCsvHeader);
  const suggested = suggestMpesaStatementMapping(headers);
  const fields: (keyof MpesaStatementColumnMapping)[] = ["confirmationCode", "amount", "phone", "occurredAt"];
  const candidates = templates.map(template => {
    const storedHeaders = template.headers?.map(normalizeCsvHeader) || [];
    const exact = Boolean(template.headersSignature && template.headersSignature === mpesaStatementHeadersSignature(headers));
    const mapping = exact && !storedHeaders.length ? template.mapping : fields.reduce((result, field) => {
      const storedIndex = template.mapping[field];
      const storedHeader = storedIndex >= 0 ? storedHeaders[storedIndex] : "";
      const directIndex = storedHeader ? normalizedHeaders.indexOf(storedHeader) : -1;
      const fallbackIndex = suggested[field];
      return { ...result, [field]: directIndex >= 0 ? directIndex : fallbackIndex };
    }, {} as MpesaStatementColumnMapping);
    const expectedFields = fields.filter(field => template.mapping[field] >= 0);
    const matchedFields = expectedFields.filter(field => mapping[field] >= 0);
    const requiredFieldsPresent = mapping.confirmationCode >= 0 && mapping.amount >= 0 && mapping.confirmationCode !== mapping.amount;
    if (!requiredFieldsPresent || !expectedFields.length) return undefined;
    const confidence = exact ? 1 : matchedFields.length / expectedFields.length;
    return { template, mapping, confidence, exact } satisfies MpesaMappingTemplateDetection;
  }).filter((candidate): candidate is MpesaMappingTemplateDetection => Boolean(candidate));
  return candidates.sort((a, b) => b.confidence - a.confidence || Number(b.exact) - Number(a.exact))[0];
}
function parseCsvLine(line: string) { const cells: string[] = []; let cell = ""; let quoted = false; for (let index = 0; index < line.length; index += 1) { const char = line[index]; if (char === '"') { if (quoted && line[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted; } else if (char === "," && !quoted) { cells.push(cell.trim()); cell = ""; } else cell += char; } cells.push(cell.trim()); return cells; }
function parseStatementAmount(value: string) { const normalized = value.replace(/\s/g, "").replace(/[^0-9.\-()]/g, ""); if (!normalized) return undefined; const parenthesized = normalized.startsWith("(") && normalized.endsWith(")"); const numeric = Number(normalized.replace(/[()]/g, "")); if (!Number.isFinite(numeric)) return undefined; return parenthesized ? -numeric : numeric; }
function normalizeReceiptCode(value: string) { return value.trim().toUpperCase().replace(/\s+/g, ""); }
function normalizePhone(value?: string) { if (!value) return ""; return value.replace(/\D/g, "").replace(/^254/, "0"); }
export function parseMpesaStatementCsv(csv: string, mapping?: MpesaStatementColumnMapping): MpesaStatementParseResult {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return { rows: [], invalidRows: [] };
  const headers = parseCsvLine(lines[0]);
  const selected = mapping || suggestMpesaStatementMapping(headers);
  const codeIndex = selected.confirmationCode;
  const amountIndex = selected.amount;
  if (codeIndex < 0 || amountIndex < 0) return { rows: [], invalidRows: Array.from({ length: lines.length - 1 }, (_, index) => index + 2) };
  const rows: MpesaStatementRow[] = [];
  const invalidRows: number[] = [];
  lines.slice(1).forEach((line, index) => {
    const cells = parseCsvLine(line);
    const confirmationCode = normalizeReceiptCode(cells[codeIndex] || "");
    const amount = parseStatementAmount(cells[amountIndex] || "");
    if (!confirmationCode || amount === undefined || amount <= 0) { invalidRows.push(index + 2); return; }
    rows.push({ rowNumber: index + 2, confirmationCode, amount: Math.round(amount * 100) / 100, phone: selected.phone >= 0 ? cells[selected.phone]?.trim() || undefined : undefined, occurredAt: selected.occurredAt >= 0 ? cells[selected.occurredAt]?.trim() || undefined : undefined });
  });
  return { rows, invalidRows };
}
export function matchMpesaStatementRows(statementRows: MpesaStatementRow[], sales: Sale[]): MpesaStatementMatchResult {
  const seenCodes = new Set<string>();
  const matches: MpesaStatementMatch[] = [];
  const unmatched: MpesaStatementRow[] = [];
  const duplicateRows: MpesaStatementRow[] = [];
  statementRows.forEach(row => {
    const code = normalizeReceiptCode(row.confirmationCode);
    if (seenCodes.has(code)) { duplicateRows.push(row); return; }
    seenCodes.add(code);
    const candidates = sales.filter(sale => sale.paymentMethod === "mpesa_manual" && sale.status !== "voided" && sale.reconciliationStatus !== "reconciled" && normalizeReceiptCode(sale.mpesaReceiptNumber || "") === code && (Math.abs((sale.amountGiven || sale.total) - row.amount) < 0.01 || Math.abs(sale.total - row.amount) < 0.01) && (!row.phone || !sale.mpesaPhone || normalizePhone(row.phone) === normalizePhone(sale.mpesaPhone)));
    if (candidates.length === 1) matches.push({ row, sale: candidates[0] }); else if (candidates.length === 0) unmatched.push(row); else duplicateRows.push(row);
  });
  return { matches, unmatched, duplicateRows };
}

export function isValidBackup(value: unknown): value is { version: number; state: AppState } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { version?: unknown; state?: AppState };
  return typeof candidate.version === "number" && Boolean(candidate.state?.products) && Boolean(candidate.state?.sales) && Boolean(candidate.state?.settings);
}
