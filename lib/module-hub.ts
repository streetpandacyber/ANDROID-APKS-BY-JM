export type ModuleHubTarget = "pos" | "notes" | "calculator" | "receipt";

export type ModuleHubItem = {
  key: ModuleHubTarget;
  headline: "POS PRO" | "NOTEBOOK" | "CALCULATOR" | "RECEIPT BOOK";
  subtitle: string;
  description: string;
  color: string;
};

export const MODULE_HUB_ITEMS: readonly ModuleHubItem[] = [
  {
    key: "pos",
    headline: "POS PRO",
    subtitle: "Point of Sale System",
    description: "Sell, stock, shifts, and reports",
    color: "#FF6B35",
  },
  {
    key: "notes",
    headline: "NOTEBOOK",
    subtitle: "Notes & Records",
    description: "POS Notes and My Notebook",
    color: "#D4A853",
  },
  {
    key: "calculator",
    headline: "CALCULATOR",
    subtitle: "Advanced Calculator",
    description: "Standard, scientific, and business tools",
    color: "#F5F0E8",
  },
  {
    key: "receipt",
    headline: "RECEIPT BOOK",
    subtitle: "Receipts & Records",
    description: "Create and organize local receipts",
    color: "#27AE60",
  },
];

export function moduleDashboardTarget(target: ModuleHubTarget): ModuleHubTarget {
  return target;
}

export function moduleHubHeadlines(): string[] {
  return MODULE_HUB_ITEMS.map((item) => item.headline);
}
