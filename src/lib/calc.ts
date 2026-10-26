// Pure totals (docs/PLAN.md D4). Costs are numeric(10,2) in the database;
// sums are done in whole bani so float rounding never leaks into totals.

type WithCost = { cost: number };
type WithOrder = { performed_on: string; created_at: string };

function toBani(cost: number): number {
  return Math.round(cost * 100);
}

export function totalCost(expenses: readonly WithCost[]): number {
  const bani = expenses.reduce((sum, expense) => sum + toBani(expense.cost), 0);
  return bani / 100;
}

// History order (docs/PLAN.md §5): newest date first, then newest entry.
// performed_on is compared as a "YYYY-MM-DD" string, never parsed (D5).
export function compareHistoryOrder(a: WithOrder, b: WithOrder): number {
  if (a.performed_on !== b.performed_on) return a.performed_on < b.performed_on ? 1 : -1;
  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

export function latestExpenses<T extends WithOrder>(expenses: readonly T[], count: number): T[] {
  return [...expenses].sort(compareHistoryOrder).slice(0, count);
}
