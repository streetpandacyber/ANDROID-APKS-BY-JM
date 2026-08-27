import { describe, expect, it } from "vitest";

import { MODULE_HUB_ITEMS, moduleDashboardTarget, moduleHubHeadlines } from "../lib/module-hub";

describe("four-module launch hub", () => {
  it("keeps the requested headline order and labels", () => {
    expect(moduleHubHeadlines()).toEqual(["POS PRO", "NOTEBOOK", "CALCULATOR", "RECEIPT BOOK"]);
    expect(MODULE_HUB_ITEMS.map((item) => item.subtitle)).toEqual([
      "Point of Sale System",
      "Notes & Records",
      "Advanced Calculator",
      "Receipts & Records",
    ]);
  });

  it("routes every headline to its own module dashboard root", () => {
    expect(MODULE_HUB_ITEMS.map((item) => moduleDashboardTarget(item.key))).toEqual([
      "pos",
      "notes",
      "calculator",
      "receipt",
    ]);
    expect(new Set(MODULE_HUB_ITEMS.map((item) => item.key)).size).toBe(4);
  });
});
