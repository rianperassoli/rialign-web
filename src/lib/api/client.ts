/**
 * Centralized API client.
 *
 * It is **isomorphic**: it always talks to the relative path `/api/v1/...`,
 * which is served by the SvelteKit proxy (`src/routes/api/v1/[...path]`). The
 * proxy attaches the JWT from the httpOnly session cookie, so the token never
 * touches client JS and the same code path works in `load` (SSR) and in the
 * browser.
 *
 * Pass SvelteKit's `fetch` inside `load`/actions so SSR requests resolve to the
 * app origin and forward cookies; in the browser the global `fetch` is fine.
 */
import type {
  Account,
  AccountInput,
  AuthPayload,
  Category,
  CategoryInput,
  Collection,
  CreditCard,
  CreditCardInput,
  CreditCardInvoice,
  Dashboard,
  DeleteScope,
  PayInvoiceInput,
  Report,
  Resource,
  SeriesOptions,
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransferInput,
  User
} from "./types";

const BASE = "/api/v1";

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors.length ? errors : [message];
  }
}

type Fetch = typeof fetch;
type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** Retry count for idempotent (GET) requests on network/5xx errors. */
  retries?: number;
}

function buildQuery(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function createApiClient(fetchFn: Fetch = fetch) {
  async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const { query, body, retries = method === "GET" ? 2 : 0 } = options;
    const url = `${BASE}${path}${buildQuery(query)}`;

    let attempt = 0;
    // Retry loop: only GETs retry (configurable), with linear backoff.
    while (true) {
      try {
        const res = await fetchFn(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : {},
          body: body ? JSON.stringify(body) : undefined
        });

        if (res.status === 204) return undefined as T;

        const payload = await res.json().catch(() => null);

        if (!res.ok) {
          const message = (payload?.message as string) ?? `Request failed (${res.status})`;
          const errors = (payload?.errors as string[]) ?? [];
          // Retry transient server errors for idempotent requests.
          if (res.status >= 500 && attempt < retries) {
            attempt++;
            await delay(attempt * 150);
            continue;
          }
          throw new ApiError(res.status, message, errors);
        }

        return payload as T;
      } catch (err) {
        if (err instanceof ApiError) throw err;
        if (attempt < retries) {
          attempt++;
          await delay(attempt * 150);
          continue;
        }
        throw new ApiError(0, err instanceof Error ? err.message : "Network error");
      }
    }
  }

  return {
    request,

    auth: {
      me: () => request<Resource<User>>("GET", "/auth/me")
    },

    accounts: {
      list: () => request<Collection<Account>>("GET", "/accounts"),
      get: (id: number) => request<Resource<Account>>("GET", `/accounts/${id}`),
      create: (account: AccountInput) => request<Resource<Account>>("POST", "/accounts", { body: { account } }),
      update: (id: number, account: Partial<AccountInput>) =>
        request<Resource<Account>>("PATCH", `/accounts/${id}`, { body: { account } }),
      remove: (id: number) => request<void>("DELETE", `/accounts/${id}`)
    },

    creditCards: {
      list: () => request<Collection<CreditCard>>("GET", "/credit_cards"),
      get: (id: number) => request<Resource<CreditCard>>("GET", `/credit_cards/${id}`),
      create: (credit_card: CreditCardInput) =>
        request<Resource<CreditCard>>("POST", "/credit_cards", { body: { credit_card } }),
      update: (id: number, credit_card: Partial<CreditCardInput>) =>
        request<Resource<CreditCard>>("PATCH", `/credit_cards/${id}`, { body: { credit_card } }),
      remove: (id: number) => request<void>("DELETE", `/credit_cards/${id}`),
      invoice: (id: number, month?: string) =>
        request<Resource<CreditCardInvoice>>("GET", `/credit_cards/${id}/invoice`, { query: { month } }),
      payInvoice: (id: number, payment: PayInvoiceInput = {}) =>
        request<Resource<Transaction>>("POST", `/credit_cards/${id}/pay_invoice`, { body: { payment } })
    },

    categories: {
      list: (kind?: "income" | "expense") => request<Collection<Category>>("GET", "/categories", { query: { kind } }),
      create: (category: CategoryInput) => request<Resource<Category>>("POST", "/categories", { body: { category } }),
      update: (id: number, category: Partial<CategoryInput>) =>
        request<Resource<Category>>("PATCH", `/categories/${id}`, { body: { category } }),
      remove: (id: number) => request<void>("DELETE", `/categories/${id}`)
    },

    transfers: {
      list: () => request<Collection<Transaction>>("GET", "/transfers"),
      create: (transfer: TransferInput) => request<void>("POST", "/transfers", { body: { transfer } }),
      remove: (transferId: string) => request<void>("DELETE", `/transfers/${transferId}`)
    },

    transactions: {
      list: (filters: TransactionFilters = {}) =>
        request<Collection<Transaction>>("GET", "/transactions", { query: filters as Query }),
      get: (id: number) => request<Resource<Transaction>>("GET", `/transactions/${id}`),
      create: (transaction: TransactionInput, series: SeriesOptions = {}) =>
        request<Resource<Transaction>>("POST", "/transactions", { body: { transaction, ...series } }),
      update: (id: number, transaction: Partial<TransactionInput>) =>
        request<Resource<Transaction>>("PATCH", `/transactions/${id}`, { body: { transaction } }),
      remove: (id: number, scope: DeleteScope = "one") =>
        request<void>("DELETE", `/transactions/${id}`, { query: { scope: scope === "one" ? undefined : scope } })
    },

    dashboard: {
      get: (month?: string) => request<Resource<Dashboard>>("GET", "/dashboard", { query: { month } }),
      balances: () =>
        request<Resource<Pick<Dashboard, "consolidated_balance" | "accounts" | "credit_cards">>>(
          "GET",
          "/dashboard/balances"
        )
    },

    reports: {
      get: (months?: number) => request<Resource<Report>>("GET", "/reports", { query: { months } })
    },

    /** Auth endpoints used by server form actions (token-issuing). */
    authPayload: (path: "/auth/login" | "/auth/register", body: unknown) => request<AuthPayload>("POST", path, { body })
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ApiClient = ReturnType<typeof createApiClient>;
