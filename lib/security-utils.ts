export function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export function validateBackupEnvelope(value: unknown): value is { version: number; state: Record<string, unknown> } {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const state = record.state;
  if (record.version !== 1 || !state || typeof state !== "object") return false;
  const saved = state as Record<string, unknown>;
  return Array.isArray(saved.products) && Array.isArray(saved.sales) && Array.isArray(saved.receipts) && !!saved.settings && typeof saved.settings === "object";
}

export function isValidBackupSize(value: string) {
  return new TextEncoder().encode(value).byteLength <= MAX_BACKUP_BYTES;
}
