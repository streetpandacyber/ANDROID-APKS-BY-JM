# ShopMate Offline — Mobile Interface Design Plan

## Product Direction

ShopMate Offline is a single-device, single-shop business companion for cashiers and small shop owners. It is designed for portrait Android use, one-handed operation, daylight readability, and reliable operation with no internet connection. The primary job is to make a cashier’s selling loop fast: start a shift, find a product, add it to a cart, calculate change, complete the sale, and review the day.

The interface follows mainstream iOS Human Interface Guidelines patterns adapted for Android: clear navigation hierarchy, large touch targets, grouped settings, bottom sheets for focused tasks, inline validation, confirmation before destructive actions, and persistent visual feedback for saved state. Lists are vertical and scan-friendly rather than grid-based.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| App Lock | PIN/password entry on app open, optional biometric-ready layout, error feedback, and local unlock state. |
| Home / Module Hub | Four module cards: POS, Notebook, Calculator, Receipt Book; current shift status; today’s sales snapshot; quick actions. |
| POS Shift Start | Cashier name entry, optional cashier PIN, shift start timestamp, and continue button. |
| POS Sell | Pinned search field, category chips, vertical product list, product thumbnail, product name, price, balance/low-stock status, and tap-to-add interaction. |
| Product Editor | Create or edit product name, image, SKU, price, category, quantity type, opening/current stock, tax/VAT, and low-stock threshold. |
| POS Cart | Notepad-style handwritten item lines, quantity controls, discounts, void/refund actions, amount-given field, live handwritten change calculation, and complete sale CTA. |
| POS Calculator | Full standalone calculator display and keypad with add, subtract, multiply, divide, percentage, clear, backspace, and Send to Cart. |
| Stock Management | Overall received stock, sold stock, balance stock, low-stock highlights, restock form, and stock-adjustment history. |
| Sales History | Completed transactions with cashier, timestamp, total, payment, balance/change, discounts, refunds, and detail view. |
| Reports | Filter by cashier and date range, totals, item counts, cash handled, historical summaries, and local report export. |
| End-of-Day Summary | Shift/day totals for sales, items sold, cash handled, discounts/refunds, and end-shift action. |
| POS Notebook | Independent notebook for cashier notes related to POS work; searchable entries and date stamps. |
| General Notebook | Independent general notes; create, edit, pin, search, and delete with confirmation. |
| Calculator | Standalone modern calculator outside POS, with large keypad and copy/share-local-result action. |
| Receipt Book | Manual receipt form independent from inventory, receipt list, receipt preview, and local save/export. |
| Receipt Camera Capture | Camera-based receipt capture workflow with preview, crop/retake/confirm actions, and local storage. |
| Settings | Currency symbol, number format, theme toggle, app lock, optional edit/delete PIN, backup, restore, and data-management controls. |
| Backup / Restore | Export all local data to one device file and import/restore from a selected file, with validation and confirmation. |

## Navigation Model

The Home / Module Hub is the landing screen after unlock. A compact bottom tab bar provides **Home**, **POS**, **Notes**, and **More**. The POS tab opens the active selling flow and exposes segmented controls for **Sell**, **Cart**, **Stock**, **Sales**, and **Reports**. Calculator is available from Home and More, and also from the POS action row. Receipt Book is available from Home and More. This avoids forcing a cashier through a deep hierarchy during a sale.

All destructive actions use a confirmation alert or bottom sheet. Product editing, stock adjustment, sales deletion, report deletion, voids, and refunds consult the optional protection PIN when enabled. The active cashier and shift badge remain visible in POS screens so every completed sale is visibly associated with the current session.

## Key User Flows

### Start a cashier shift

1. User unlocks the app with the local PIN/password.
2. User taps POS from the module hub or tab bar.
3. User enters a cashier name and, when configured, the linked cashier PIN.
4. The app records the local shift start timestamp and shows the POS Sell screen.

### Complete a sale

1. User focuses the pinned search field and filters by product name, SKU, or category.
2. User taps a vertical product row to add it to the cart.
3. User adjusts quantity using the row stepper; quantity supports pieces, kg, liters, or another configured type.
4. User opens Cart, reviews the orange handwritten-style lines, and applies an optional discount.
5. User enters Amount Given; the notepad calculation updates live with total and balance/change.
6. User taps Complete Sale and confirms if a refund or void is present.
7. The app stores the transaction locally, decreases product balance stock, increases sold stock, tags the active cashier and shift, and clears the cart.

### Restock products

1. User opens POS > Stock.
2. User taps Restock on a product or the add-restock button.
3. User enters quantity and an optional note.
4. The app records date, quantity, and the active user in stock-adjustment history, then updates overall and balance stock.

### Review the day

1. User opens POS > Reports.
2. User chooses a cashier and date range, or selects End of Day.
3. The app calculates total sales, items sold, cash handled, discounts, refunds, and transaction count from local data.
4. User exports the report to a local file or shares it through the Android system sheet without requiring internet.

### Backup and restore

1. User opens Settings > Backup / Restore.
2. User taps Export Backup; the app serializes all local records into one versioned file and opens the local save/share sheet.
3. User selects Import / Restore and chooses a compatible backup file from the device.
4. The app validates the file, previews its record counts, requires confirmation, and restores local data atomically.

## Visual System

| Token | Choice | Use |
|---|---|---|
| Primary background | `#0D1B2A` | App background, status-bar-safe canvas, calculator screen |
| Secondary surface | `#1B2A41` | Cards, list rows, sheets, tab bar |
| Primary orange | `#FF7A00` | Primary actions, active tabs, totals, key highlights |
| Amber gold | `#FFB347` | Secondary icons, labels, subtle emphasis |
| Primary text | `#F5F5F5` | Headings, values, product names |
| Secondary text | `#A9B4C0` | Supporting labels, timestamps, helper copy |
| Success teal | `#2ECC71` | Completed sales, healthy stock, saved confirmation |
| Warning red | `#E74C3C` | Low stock, destructive actions, invalid input |
| Border | `#31445F` | Dividers and outlined controls |
| Light theme background | `#F5F7FA` | Optional light-mode canvas |
| Light theme surface | `#FFFFFF` | Optional light-mode cards |

Dark navy is the default and must retain strong contrast for outdoor use. Light mode keeps orange as the action color but shifts the canvas to a near-white background. Buttons use orange fill with navy text for primary actions, or navy fill with orange border for secondary actions. Corners are rounded but restrained, shadows are soft, and icons are line-style Material symbols in orange or white.

## Typography and Component Rules

Use a system sans font for operational screens and a locally bundled handwriting font for cart item lines and change output. Headings are compact and semibold; operational values are large and high contrast. Minimum interactive touch target is 44–48 dp. Product rows use a consistent height with the image at left, product metadata in the middle, and price/status at right. Search remains pinned while the product list scrolls.

Cart lines use an off-white notepad panel with subtle horizontal rules and orange ink, while the surrounding screen remains navy. The notepad is decorative but not at the cost of legibility. Calculator keys use a large 4-column layout, orange primary operators, navy number keys with orange borders, and a full-width Send to Cart action when a POS cart is active.

## Offline and State Feedback

Every save writes to local device storage and immediately shows a small “Saved on this device” confirmation. The app never presents cloud-sync language, network-dependent loading, or remote account requirements. Empty states explain the next local action, such as “Add your first product” or “Start a shift to record sales.” Error messages are actionable and remain visible until corrected.
