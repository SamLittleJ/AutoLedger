// Codes are stored in the database; labels are shown in the UI (docs/PLAN.md §5).
export const CATEGORIES = [
  { code: "service", label: "Revizie" },
  { code: "repair", label: "Reparație" },
  { code: "consumables", label: "Consumabile" },
  { code: "fuel", label: "Combustibil" },
  { code: "accessories", label: "Accesorii" },
  { code: "other", label: "Altele" },
] as const;

export type ExpenseCategory = (typeof CATEGORIES)[number]["code"];

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return CATEGORIES.some((category) => category.code === value);
}

export function getCategoryLabel(code: string): string {
  return CATEGORIES.find((category) => category.code === code)?.label ?? code;
}
