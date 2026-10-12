/**
 * Display + parsing helpers. The API sends money as strings (decimal precision),
 * so `parseMoney` is the single place we convert to a number for arithmetic.
 */

import { getLocale } from "$lib/paraglide/runtime";

/**
 * Money is always in reais: the API stores plain decimals and the ledger is
 * Brazilian, so the currency belongs to the data, not to the language the UI
 * happens to be in. The locale only decides how it is written — R$ 1.234,56 in
 * pt-BR, R$ 1,234.56 in en-US.
 */
const DEFAULT_CURRENCY = "BRL";

/** The active UI locale ("en-US" by default), also a valid Intl locale tag. */
function activeLocale(): string {
  return getLocale();
}

/** Parse an API money string (or number) into a JS number. */
export function parseMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrency(
  value: string | number | null | undefined,
  options: { currency?: string; locale?: string; signed?: boolean } = {}
): string {
  const { currency = DEFAULT_CURRENCY, locale = activeLocale(), signed = false } = options;
  const amount = parseMoney(value);
  const formatted = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  return signed && amount > 0 ? `+${formatted}` : formatted;
}

/**
 * Parse "YYYY-MM-DD" / "YYYY-MM" as a LOCAL date. `new Date("2026-05-01")`
 * parses as UTC midnight, which renders as the previous day (or month) in
 * negative-offset timezones.
 */
function toLocalDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3] ?? 1));
  return new Date(value);
}

export function formatDate(value: string | Date | null | undefined, locale = activeLocale()): string {
  if (!value) return "—";
  const date = toLocalDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatMonth(value: string | Date, locale = activeLocale()): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(toLocalDate(value));
}

/** "YYYY-MM" for the current month, used as the dashboard default. */
export function currentMonthParam(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * "YYYY-MM-DD" for date inputs, in the LOCAL calendar. `toISOString()` would
 * convert to UTC first, so in UTC-3 anything after 21:00 came back as tomorrow.
 */
export function toDateInput(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Mask all but the last `visible` characters of sensitive data (e.g. card no.). */
export function maskNumber(value: string, visible = 4): string {
  if (value.length <= visible) return value;
  return `•••• ${value.slice(-visible)}`;
}
