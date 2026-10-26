import { parseCost, parseOdometer } from "@/lib/numbers";

describe("parseCost", () => {
  it.each([
    ["350", 350],
    ["350,5", 350.5],
    ["350.50", 350.5],
    ["0", 0],
    ["99999999.99", 99999999.99],
  ])("parses %s", (input, expected) => {
    expect(parseCost(input)).toEqual({ ok: true, value: expected });
  });

  it.each(["", "-1", "1,234", "abc", "1.", "100000000"])("rejects %p", (input) => {
    expect(parseCost(input).ok).toBe(false);
  });
});

describe("parseOdometer", () => {
  it("allows an empty value when optional", () => {
    expect(parseOdometer(" ", { optional: true })).toEqual({ ok: true, value: null });
    expect(parseOdometer("", { optional: false }).ok).toBe(false);
  });

  it("parses whole numbers, ignoring spaces", () => {
    expect(parseOdometer("152 300", { optional: true })).toEqual({ ok: true, value: 152300 });
    expect(parseOdometer("0", { optional: true })).toEqual({ ok: true, value: 0 });
  });

  it.each(["-5", "12.5", "12,5", "1e3", "2147483648"])("rejects %p", (input) => {
    expect(parseOdometer(input, { optional: true }).ok).toBe(false);
  });
});
