export type QuantityType = "unit" | "kg" | "liter";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantityType: QuantityType;
  overallStock: number;
  soldStock: number;
  taxRate: number;
  lowStockThreshold: number;
  cost?: number;
  barcode?: string;
  notes?: string;
  imageUri?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CartLine = { productId: string; quantity: number; unitPrice: number };

export type Cashier = { id: string; name: string; pin?: string; role?: "owner" | "cashier"; editPin?: string };

export type AuditEntry = { id: string; type: "stock" | "refund" | "void" | "cashier" | "reconciliation"; action: string; cashierName?: string; productId?: string; saleId?: string; quantity?: number; reason?: string; authorizedBy?: string; createdAt: string };

export type Shift = { id: string; cashierName: string; shiftName?: string; startedAt: string; endedAt?: string };

export type StockAdjustment = {
  id: string;
  productId: string;
  quantity: number;
  note?: string;
  type?: "restock" | "sale" | "refund" | "void";
  createdAt: string;
  createdBy: string;
};

export type SaleLine = {
  productId: string;
  name: string;
  quantity: number;
  quantityType: QuantityType;
  unitPrice: number;
  lineTotal: number;
};

export type SalePaymentMethod = "cash" | "mpesa_manual";
export type ReconciliationStatus = "unreconciled" | "reconciled";

export type Sale = {
  id: string;
  shiftId: string;
  cashierName: string;
  createdAt: string;
  items: SaleLine[];
  subtotal: number;
  discount: number;
  refund: number;
  total: number;
  amountGiven: number;
  change: number;
  status?: "completed" | "voided" | "refunded";
  authorizedBy?: string;
  actionAt?: string;
  paymentMethod?: SalePaymentMethod;
  mpesaReceiptNumber?: string;
  mpesaPhone?: string;
  reconciliationStatus?: ReconciliationStatus;
  reconciledAt?: string;
  reconciledBy?: string;
};

export type NotebookEntry = {
  id: string;
  notebook: "pos" | "general";
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  shiftId?: string;
  saleId?: string;
  pinned?: boolean;
  folder?: string;
  color?: string;
  pageStyle?: "lined" | "grid" | "plain" | "dotted";
  archived?: boolean;
  trashedAt?: string;
};

export type ReceiptImage = { id: string; receiptId: string; localPath: string; createdAt: string };

export type ReceiptLine = { description: string; quantity: number; unitPrice: number; amount: number };

export type ReceiptThumbnail = { title: string; total: number; currency: string; date: string; itemCount: number; imageUri?: string };

export type ReceiptEntry = {
  id: string;
  receiptNumber: string;
  title?: string;
  customerName: string;
  merchantName: string;
  notes?: string;
  date: string;
  lines: ReceiptLine[];
  subtotal?: number;
  discount?: number;
  discountMode?: "amount" | "percent";
  tax?: number;
  taxMode?: "amount" | "percent";
  total: number;
  source: "manual" | "camera";
  images: ReceiptImage[];
  thumbnail?: ReceiptThumbnail;
  deletedAt?: string;
};

export type MpesaMappingTemplate = {
  id: string;
  name: string;
  headersSignature: string;
  headers?: string[];
  mapping: { confirmationCode: number; amount: number; phone: number; occurredAt: number };
  createdAt: string;
  updatedAt?: string;
};

export type AppSettings = {
  currency: string;
  decimalPlaces: number;
  theme: "dark" | "light";
  appPin?: string;
  editPin?: string;
  pinEnabled: boolean;
  editPinEnabled: boolean;
  ownerPin?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessTaxId?: string;
  businessLogoUri?: string;
  receiptFooter?: string;
  receiptTemplate?: "classic" | "minimal" | "thermal";
  thermalWidth?: "58mm" | "80mm";
  developerName?: string;
  autoBalanceParentheses?: boolean;
  latestKnownVersion?: string;
  latestKnownReleaseDate?: string;
  mpesaMappingTemplates?: MpesaMappingTemplate[];
};

export type FeedbackEntry = {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type AppState = {
  schemaVersion: number;
  settings: AppSettings;
  products: Product[];
  cashiers: Cashier[];
  shifts: Shift[];
  stockAdjustments: StockAdjustment[];
  sales: Sale[];
  notebooks: NotebookEntry[];
  receipts: ReceiptEntry[];
  deletedReceipts: ReceiptEntry[];
  calculatorHistory: string[];
  auditLog: AuditEntry[];
  feedback: FeedbackEntry[];
  activeShiftId?: string;
};

export const initialState: AppState = {
  schemaVersion: 2,
  settings: { currency: "KSH", decimalPlaces: 2, theme: "dark", pinEnabled: true, editPinEnabled: false, receiptTemplate: "classic", thermalWidth: "80mm", businessName: "ShopMate Offline", receiptFooter: "Thank you for shopping with us.", developerName: "JM Majiwa", autoBalanceParentheses: false, latestKnownVersion: "1.0.0", latestKnownReleaseDate: "26 August 2026", mpesaMappingTemplates: [] },
  products: [
    { id: "bread", name: "Bread", sku: "BRD-001", category: "Bakery", price: 60, quantityType: "unit", overallStock: 34, soldStock: 0, taxRate: 0, lowStockThreshold: 8 },
    { id: "milk", name: "Fresh Milk", sku: "MLK-002", category: "Dairy", price: 480, quantityType: "liter", overallStock: 12, soldStock: 0, taxRate: 0, lowStockThreshold: 3 },
    { id: "rice", name: "Premium Rice", sku: "RIC-003", category: "Groceries", price: 1450, quantityType: "kg", overallStock: 18, soldStock: 0, taxRate: 0, lowStockThreshold: 4 },
    { id: "soap", name: "Laundry Soap", sku: "SOP-004", category: "Household", price: 350, quantityType: "unit", overallStock: 5, soldStock: 0, taxRate: 0, lowStockThreshold: 6 },
  ],
  cashiers: [],   shifts: [], stockAdjustments: [], sales: [], notebooks: [], receipts: [], deletedReceipts: [], calculatorHistory: [], auditLog: [], feedback: [],
};

export function freshId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
