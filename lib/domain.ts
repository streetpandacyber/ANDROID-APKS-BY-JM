import type { AppState, CartLine, Product, Sale } from "./types";

export function calculateSale(cart: CartLine[], products: Product[], discount = 0, amountGiven = 0) {
  const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total, amountGiven, change: Math.max(0, amountGiven - total) };
}

export function balanceStock(product: Product) {
  return Math.max(0, product.overallStock - product.soldStock);
}

export function isLowStock(product: Product) {
  return balanceStock(product) <= product.lowStockThreshold;
}

export function filterSales(sales: Sale[], cashier = "All", from = "", to = "") { return sales.filter(sale => (cashier === "All" || sale.cashierName === cashier) && (!from || sale.createdAt.slice(0, 10) >= from) && (!to || sale.createdAt.slice(0, 10) <= to)); }

export function canAuthorizeAction(inputPin: string, appPin?: string, editPin?: string, cashierPin?: string) { return Boolean(inputPin) && [appPin, editPin, cashierPin].some(pin => Boolean(pin) && pin === inputPin); }

export function isValidBackup(value: unknown): value is { version: number; state: AppState } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { version?: unknown; state?: AppState };
  return typeof candidate.version === "number" && Boolean(candidate.state?.products) && Boolean(candidate.state?.sales) && Boolean(candidate.state?.settings);
}
