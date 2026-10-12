/**
 * Types mirroring the Rialign Rails API (`/api/v1`).
 *
 * Money values arrive as **strings** (the API serializes `decimal` columns as
 * strings to preserve precision). Use `parseMoney` from `$utils/formatting` to
 * turn them into numbers for arithmetic, and keep the raw string for display.
 */

export type Money = string;
export type ISODate = string; // "YYYY-MM-DD"
export type ISODateTime = string;

export type TransactionKind = "income" | "expense";
export type AccountType = "checking" | "savings" | "cash" | "other";

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: ISODateTime;
}

export interface Account {
  id: number;
  name: string;
  account_type: AccountType;
  initial_balance: Money;
  current_balance: Money;
  exclude_from_total: boolean;
  archived: boolean;
  created_at: ISODateTime;
}

export interface CreditCard {
  id: number;
  name: string;
  credit_limit: Money;
  closing_day: number;
  due_day: number;
  /** The invoice accumulating charges today ("YYYY-MM", named after its due month). */
  current_invoice_month: string;
  next_invoice: Money;
  payment_account_id: number | null;
  open_invoice: Money;
  available_limit: Money;
  archived: boolean;
  created_at: ISODateTime;
}

export interface Category {
  id: number;
  name: string;
  kind: TransactionKind;
  color: string | null;
  archived: boolean;
}

export interface Transaction {
  id: number;
  description: string;
  kind: TransactionKind;
  amount: Money;
  signed_amount: Money;
  date: ISODate;
  paid: boolean;
  notes: string | null;
  category: Pick<Category, "id" | "name" | "kind" | "color"> | null;
  account_id: number | null;
  credit_card_id: number | null;
  /** The invoice a card charge sits on ("YYYY-MM", its due month); null off a card. */
  invoice_month: string | null;
  /** Present on the two legs of a transfer and on invoice-settlement legs. */
  transfer_id: string | null;
  /** Shared by every occurrence of an installment or fixed (monthly) series. */
  series_id: string | null;
  /** Set on installment legs only, e.g. 3 of 12. */
  installment_number: number | null;
  installment_total: number | null;
  created_at: ISODateTime;
}

export interface CategoryTotal {
  category_id: number;
  name: string;
  color: string | null;
  total: Money;
}

export interface Dashboard {
  period: { from: ISODate; to: ISODate };
  totals: { income: Money; expense: Money; net: Money };
  forecast: { income: Money; expense: Money };
  by_category: CategoryTotal[];
  consolidated_balance: Money;
  accounts: Account[];
  credit_cards: CreditCard[];
}

/** A credit card's monthly invoice: the cycle that closes in `month`. */
export interface CreditCardInvoice {
  month: string; // "YYYY-MM"
  period: { from: ISODate; to: ISODate };
  closing_date: ISODate;
  due_date: ISODate;
  total: Money;
  pending: Money;
  status: "open" | "closed" | "paid";
  /** Whether the invoices either side are paid — a charge cannot be moved onto one. */
  previous_paid: boolean;
  next_paid: boolean;
  transactions: Transaction[];
}

export interface Report {
  period: { from: ISODate; to: ISODate };
  monthly: Array<{ month: string; income: Money; expense: Money; net: Money }>;
  by_category: CategoryTotal[];
}

/* ---- Response envelopes ---- */

export interface Pagination {
  page: number;
  items: number;
  count: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface Resource<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface Collection<T> {
  data: T[];
  meta: { pagination: Pagination };
}

export interface AuthPayload {
  data: { token: string; user: User };
}

export interface ApiErrorBody {
  message: string;
  errors: string[];
}

/* ---- Request inputs ---- */

export interface TransactionFilters {
  kind?: TransactionKind;
  account_id?: number;
  credit_card_id?: number;
  category_id?: number;
  paid?: boolean;
  from?: ISODate;
  to?: ISODate;
  search?: string;
  sort?: "date" | "amount" | "created_at";
  direction?: "asc" | "desc";
  page?: number;
  items?: number;
}

export interface TransactionInput {
  description: string;
  kind: TransactionKind;
  amount: number | string;
  date: ISODate;
  paid?: boolean;
  notes?: string | null;
  category_id: number;
  account_id?: number | null;
  credit_card_id?: number | null;
  /** Push a card charge to another invoice ("YYYY-MM"); omitted, it follows the date. */
  invoice_month?: string;
}

export interface AccountInput {
  name: string;
  account_type: AccountType;
  initial_balance: number | string;
}

export interface CategoryInput {
  name: string;
  kind: TransactionKind;
  color?: string | null;
}

export interface CreditCardInput {
  name: string;
  credit_limit: number | string;
  closing_day: number;
  due_day: number;
  payment_account_id?: number | null;
}

export interface TransferInput {
  from_account_id: number;
  to_account_id: number;
  amount: number | string;
  date: ISODate;
  description?: string;
  notes?: string | null;
}

export interface PayInvoiceInput {
  account_id?: number;
  date?: ISODate;
  /** Settle only charges up to this invoice's closing date ("YYYY-MM"). */
  month?: string;
}

/**
 * Turns a single submission into a monthly series:
 *  - installments: the amount is the TOTAL, split into N legs (e.g. 12x)
 *  - fixed_months: the amount repeats as-is for N months (rent, salary...)
 */
export interface SeriesOptions {
  installments?: number;
  fixed_months?: number;
}

/** How much of a series a DELETE removes. */
export type DeleteScope = "one" | "future" | "series";

/** Status of a background Organizze import. */
export type ImportStatus = "pending" | "analyzing" | "awaiting_input" | "importing" | "completed" | "failed";

/** What the first pass found in the file, before anything is written. */
export interface ImportPreview {
  accounts?: { name: string; rows: number }[];
  credit_cards?: { name: string; rows: number; closing_day: number; invoice_months: string[] }[];
}

/** The answers the export cannot give, keyed by the name in the file. */
export interface ImportSettings {
  open_from?: string;
  accounts?: Record<string, { exclude_from_total?: boolean }>;
  credit_cards?: Record<string, { closing_day?: number; due_day?: number; credit_limit?: string }>;
}

/** What the import wrote, keyed as the API reports it. */
export interface ImportReport {
  imported?: number;
  accounts?: number;
  credit_cards?: number;
  categories?: number;
  replaced?: number;
  skipped_zero?: number;
  skipped_card_credit?: number;
  skipped_no_date?: number;
}

export interface Import {
  id: number;
  status: ImportStatus;
  filename: string;
  preview: ImportPreview;
  report: ImportReport;
  error_message: string | null;
  created_at: string;
}
