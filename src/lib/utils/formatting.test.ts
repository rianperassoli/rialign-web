import { describe, expect, it } from "vitest";
import { currentMonthParam, formatCurrency, formatDate, maskNumber, parseMoney, toDateInput } from "./formatting";

// Intl separates the symbol with a non-breaking space; compare on a plain one.
const plain = (value: string) => value.replace(/\u00a0/g, " ");

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
  it("formats a money string as BRL in the base locale", () => {
    expect(plain(formatCurrency("1234.5"))).toBe("R$1,234.50");
  });
  it("writes the same amount the Brazilian way in pt-BR", () => {
    expect(plain(formatCurrency("1234.5", { locale: "pt-BR" }))).toBe("R$ 1.234,50");
  });
  it("prefixes a plus sign when signed and positive", () => {
    expect(plain(formatCurrency("10", { signed: true }))).toBe("+R$10.00");
  });
  it("does not prefix negatives", () => {
    expect(plain(formatCurrency("-10", { signed: true }))).toBe("-R$10.00");
  });
  it("honours an explicit currency", () => {
    expect(formatCurrency("1234.5", { currency: "USD" })).toBe("$1,234.50");
  });
});

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-05-27")).toMatch(/May/);
  });
  it("follows an explicit locale", () => {
    expect(formatDate("2026-05-27", "pt-BR")).toMatch(/mai/i);
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

describe("toDateInput", () => {
  it("uses the local calendar day, not the UTC one", () => {
    // 22:30 in UTC-3 is already the next day in UTC.
    expect(toDateInput(new Date(2026, 8, 3, 22, 30))).toBe("2026-09-03");
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
