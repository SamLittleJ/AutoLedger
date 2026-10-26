// Pure totals (docs/PLAN.md D4). Costs are numeric(10,2) in the database;
// sums are done in whole bani so float rounding never leaks into totals.

type WithCost = { cost: number };

function toBani(cost: number): number {
  return Math.round(cost * 100);
}

export function totalCost(expenses: readonly WithCost[]): number {
  const bani = expenses.reduce((sum, expense) => sum + toBani(expense.cost), 0);
  return bani / 100;
}
