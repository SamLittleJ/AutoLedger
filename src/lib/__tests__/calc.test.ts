import { totalCost } from "@/lib/calc";

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
