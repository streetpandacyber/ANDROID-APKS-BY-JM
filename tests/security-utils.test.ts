import { describe, expect, it } from "vitest";
import { escapeHtml, isValidBackupSize, validateBackupEnvelope } from "../lib/security-utils";

describe("security utilities", () => {
  it("escapes receipt text and attributes", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("accepts only the supported backup envelope", () => {
    expect(validateBackupEnvelope({ version: 1, state: { products: [], sales: [], receipts: [], settings: {} } })).toBe(true);
    expect(validateBackupEnvelope({ version: 2, state: { products: [], sales: [], receipts: [], settings: {} } })).toBe(false);
    expect(validateBackupEnvelope({ version: 1, state: { products: [], sales: [] } })).toBe(false);
  });

  it("rejects oversized backup content", () => {
    expect(isValidBackupSize("x".repeat(10 * 1024 * 1024 + 1))).toBe(false);
  });
});
