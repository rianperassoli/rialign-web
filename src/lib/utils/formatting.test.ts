import { describe, expect, it } from "vitest";
import { currentMonthParam, formatCurrency, formatDate, maskNumber, parseMoney } from "./formatting";

describe("parseMoney", () => {
  it("parses decimal strings", () => {
    expect(parseMoney("120.5")).toBe(120.5);
  });
  it("falls back to 0 for invalid/empty input", () => {
    expect(parseMoney(null)).toBe(0);
    expect(parseMoney("abc")).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("formats a money string as USD", () => {
    expect(formatCurrency("1234.5")).toBe("$1,234.50");
  });
  it("prefixes a plus sign when signed and positive", () => {
    expect(formatCurrency("10", { signed: true })).toBe("+$10.00");
  });
  it("does not prefix negatives", () => {
    expect(formatCurrency("-10", { signed: true })).toBe("-$10.00");
  });
});

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-05-27")).toMatch(/May/);
  });
  it("returns a dash for empty/invalid input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("nope")).toBe("—");
  });
});

describe("currentMonthParam", () => {
  it("formats YYYY-MM", () => {
    expect(currentMonthParam(new Date("2026-03-09"))).toBe("2026-03");
  });
});

describe("maskNumber", () => {
  it("masks all but the last digits", () => {
    expect(maskNumber("4111111111111234")).toBe("•••• 1234");
  });
  it("returns short values unchanged", () => {
    expect(maskNumber("12")).toBe("12");
  });
});
