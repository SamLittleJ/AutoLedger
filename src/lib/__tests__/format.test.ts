import { formatKm, formatRon } from "@/lib/format";

describe("formatRon", () => {
  it.each([
    [0, "0,00 RON"],
    [350.5, "350,50 RON"],
    [1234.5, "1.234,50 RON"],
    [99999999.99, "99.999.999,99 RON"],
  ])("formats %p", (value, expected) => {
    expect(formatRon(value)).toBe(expected);
  });
});

describe("formatKm", () => {
  it("groups thousands", () => {
    expect(formatKm(152300)).toBe("152.300 km");
    expect(formatKm(0)).toBe("0 km");
  });
});
