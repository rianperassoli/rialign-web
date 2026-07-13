/**
 * Display + parsing helpers. The API sends money as strings (decimal precision),
 * so `parseMoney` is the single place we convert to a number for arithmetic.
 */

const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";

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
  const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, signed = false } = options;
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

export function formatDate(value: string | Date | null | undefined, locale = DEFAULT_LOCALE): string {
  if (!value) return "—";
  const date = toLocalDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatMonth(value: string | Date, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(toLocalDate(value));
}

/** "YYYY-MM" for the current month, used as the dashboard default. */
export function currentMonthParam(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" for date inputs. */
export function toDateInput(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Mask all but the last `visible` characters of sensitive data (e.g. card no.). */
export function maskNumber(value: string, visible = 4): string {
  if (value.length <= visible) return value;
  return `•••• ${value.slice(-visible)}`;
}
