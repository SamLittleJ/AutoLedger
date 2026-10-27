import { filterByCategory, latestExpenses, monthlyTotal, totalCost } from "@/lib/calc";

describe("totalCost", () => {
  it("returns 0 for an empty list", () => {
    expect(totalCost([])).toBe(0);
  });

  it("sums a known data set", () => {
    expect(totalCost([{ cost: 350 }, { cost: 120 }, { cost: 25 }])).toBe(495);
  });

  it("sums decimal values without float drift", () => {
    expect(totalCost([{ cost: 0.1 }, { cost: 0.2 }])).toBe(0.3);
    expect(totalCost([{ cost: 19.99 }, { cost: 0.01 }, { cost: 100.1 }])).toBe(120.1);
  });

  it("handles the numeric(10,2) maximum", () => {
    expect(totalCost([{ cost: 99999999.99 }, { cost: 0.01 }])).toBe(100000000);
  });
});

describe("latestExpenses", () => {
  const expense = (id: string, performed_on: string, created_at: string) => ({
    id,
    performed_on,
    created_at,
  });

  it("returns at most `count` expenses, newest date first", () => {
    const expenses = [
      expense("a", "2026-01-10", "2026-01-10T08:00:00+00:00"),
      expense("b", "2026-03-01", "2026-03-01T08:00:00+00:00"),
      expense("c", "2025-12-31", "2026-03-02T08:00:00+00:00"),
      expense("d", "2026-02-15", "2026-02-15T08:00:00+00:00"),
    ];
    expect(latestExpenses(expenses, 3).map((e) => e.id)).toEqual(["b", "d", "a"]);
  });

  it("orders by date, not by when the expense was entered", () => {
    const expenses = [
      expense("old-invoice", "2024-05-01", "2026-10-26T10:00:00+00:00"),
      expense("yesterday", "2026-10-25", "2026-10-25T10:00:00+00:00"),
    ];
    expect(latestExpenses(expenses, 1).map((e) => e.id)).toEqual(["yesterday"]);
  });

  it("breaks ties on the same date by the newest entry", () => {
    const expenses = [
      expense("first", "2026-10-25", "2026-10-25T08:00:00.5+00:00"),
      expense("second", "2026-10-25", "2026-10-25T08:00:00.123456+00:00"),
      expense("third", "2026-10-25", "2026-10-25T09:00:00+00:00"),
    ];
    expect(latestExpenses(expenses, 5).map((e) => e.id)).toEqual(["third", "first", "second"]);
  });

  it("handles fewer expenses than requested and leaves the input untouched", () => {
    const expenses = [
      expense("a", "2026-01-01", "2026-01-01T08:00:00+00:00"),
      expense("b", "2026-02-01", "2026-02-01T08:00:00+00:00"),
    ];
    expect(latestExpenses(expenses, 5).map((e) => e.id)).toEqual(["b", "a"]);
    expect(expenses.map((e) => e.id)).toEqual(["a", "b"]);
    expect(latestExpenses([], 5)).toEqual([]);
  });
});

describe("filterByCategory", () => {
  const expenses = [
    { id: "a", category: "fuel" },
    { id: "b", category: "service" },
    { id: "c", category: "fuel" },
  ];

  it("keeps only the chosen category, in the original order", () => {
    expect(filterByCategory(expenses, "fuel").map((e) => e.id)).toEqual(["a", "c"]);
  });

  it("returns everything for null", () => {
    expect(filterByCategory(expenses, null).map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterByCategory(expenses, "accessories")).toEqual([]);
  });
});

describe("monthlyTotal", () => {
  const on = (performed_on: string, cost: number) => ({ performed_on, cost });

  it("includes the first and the last day of the month", () => {
    expect(monthlyTotal([on("2026-10-01", 100), on("2026-10-31", 50)], "2026-10")).toBe(150);
  });

  it("excludes the previous and the next month", () => {
    const expenses = [on("2026-09-30", 1), on("2026-10-15", 40), on("2026-11-01", 2)];
    expect(monthlyTotal(expenses, "2026-10")).toBe(40);
  });

  it("returns 0 for a month without expenses and for an empty list", () => {
    expect(monthlyTotal([on("2026-09-15", 10)], "2026-10")).toBe(0);
    expect(monthlyTotal([], "2026-10")).toBe(0);
  });

  it("separates December and January across the new year", () => {
    const expenses = [on("2026-12-31", 300), on("2027-01-01", 20), on("2026-01-10", 5)];
    expect(monthlyTotal(expenses, "2026-12")).toBe(300);
    expect(monthlyTotal(expenses, "2027-01")).toBe(20);
  });

  it("excludes the same month of another year", () => {
    expect(monthlyTotal([on("2025-10-10", 99), on("2026-10-10", 1)], "2026-10")).toBe(1);
  });

  it("includes 29 February in a leap year", () => {
    expect(monthlyTotal([on("2028-02-29", 75), on("2028-03-01", 1)], "2028-02")).toBe(75);
  });

  it("sums decimals without float drift", () => {
    expect(monthlyTotal([on("2026-10-01", 0.1), on("2026-10-02", 0.2)], "2026-10")).toBe(0.3);
  });
});
