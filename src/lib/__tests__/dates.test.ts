import {
  currentMonthKey,
  formatDisplayDate,
  formatMonth,
  isValidIsoDate,
  toLocalIsoDate,
} from "@/lib/dates";

describe("toLocalIsoDate", () => {
  it("uses the local calendar day", () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
    expect(toLocalIsoDate(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("isValidIsoDate", () => {
  it("accepts real calendar days", () => {
    expect(isValidIsoDate("2026-10-25")).toBe(true);
    expect(isValidIsoDate("2024-02-29")).toBe(true);
  });

  it("rejects impossible days and other formats", () => {
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("2026-04-31")).toBe(false);
    expect(isValidIsoDate("2026-10-00")).toBe(false);
    expect(isValidIsoDate("25.10.2026")).toBe(false);
    expect(isValidIsoDate("2026-1-5")).toBe(false);
  });
});

describe("formatDisplayDate", () => {
  it("formats as DD.MM.YYYY", () => {
    expect(formatDisplayDate("2026-10-05")).toBe("05.10.2026");
  });
});

describe("currentMonthKey", () => {
  it("uses the local month around the new year", () => {
    expect(currentMonthKey(new Date(2026, 11, 31, 23, 59))).toBe("2026-12");
    expect(currentMonthKey(new Date(2027, 0, 1, 0, 0))).toBe("2027-01");
  });
});

describe("formatMonth", () => {
  it("names the month in Romanian, lowercase", () => {
    expect(formatMonth("2026-01")).toBe("ianuarie 2026");
    expect(formatMonth("2026-12")).toBe("decembrie 2026");
  });

  it("returns unexpected input unchanged", () => {
    expect(formatMonth("2026-13")).toBe("2026-13");
    expect(formatMonth("octombrie")).toBe("octombrie");
  });
});
