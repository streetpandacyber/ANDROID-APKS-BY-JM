# ShopMate Offline runtime data schema

ShopMate Offline stores runtime business data in a versioned AsyncStorage envelope. The current envelope uses `schemaVersion: 2`.

## Sale record

Each sale keeps the existing POS fields and may include these payment fields:

| Field | Type | Meaning |
|---|---|---|
| `paymentMethod` | `cash` or `mpesa_manual` | The locally recorded payment method. Legacy sales normalize to `cash`. |
| `mpesaReceiptNumber` | string, optional | Customer-provided M-Pesa confirmation code for manual records. |
| `mpesaPhone` | string, optional | Customer phone reference, if entered by the cashier. |
| `reconciliationStatus` | `unreconciled` or `reconciled` | Local statement-check status for manual M-Pesa records. |
| `reconciledAt` | ISO timestamp, optional | Local time the cashier marked the record reconciled. |
| `reconciledBy` | string, optional | Cashier or owner who performed the local reconciliation. |

Manual M-Pesa completion requires the recorded amount to cover the sale and requires a confirmation code. Codes are unique among manual M-Pesa sales. Saving a sale never calls an API or sends an STK request. New manual records start as `unreconciled` and can be marked reconciled only after the cashier compares the code with an external statement or message.

Hydration and restore normalize legacy sales to `paymentMethod: "cash"`, preserve older backup compatibility, and write the current `schemaVersion: 2`. The existing Drizzle schema is an unused server/auth scaffold and is intentionally not extended with payment tables; adding a server table would imply a cloud data path that conflicts with the product's strict offline requirement.
