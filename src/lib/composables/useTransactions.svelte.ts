/**
 * Reactive transactions list backed by the API client. Seeded with SSR data so
 * the first render needs no client fetch; subsequent filter/page changes and
 * mutations go through the proxy. Uses Svelte 5 runes (no stores).
 */
import { ApiError, createApiClient } from "$api/client";
import type {
  Collection,
  DeleteScope,
  Pagination,
  SeriesOptions,
  Transaction,
  TransactionFilters,
  TransactionInput
} from "$api/types";

function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.errors.join(", ") : "Something went wrong";
}

export function useTransactions(initial: Collection<Transaction>, initialFilters: TransactionFilters = {}) {
  const api = createApiClient();

  let items = $state<Transaction[]>(initial.data);
  let pagination = $state<Pagination>(initial.meta.pagination);
  let filters = $state<TransactionFilters>({ ...initialFilters });
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function refresh(next: Partial<TransactionFilters> = {}): Promise<void> {
    filters = { ...filters, ...next };
    loading = true;
    error = null;
    try {
      const res = await api.transactions.list(filters);
      items = res.data;
      pagination = res.meta.pagination;
    } catch (e) {
      error = errorMessage(e);
    } finally {
      loading = false;
    }
  }

  /** Reset to page 1 and apply a new filter set (used by the filter bar). */
  function applyFilters(next: Partial<TransactionFilters>): Promise<void> {
    return refresh({ ...next, page: 1 });
  }

  function setPage(page: number): Promise<void> {
    return refresh({ page });
  }

  async function create(input: TransactionInput, series: SeriesOptions = {}): Promise<Transaction> {
    error = null;
    try {
      const res = await api.transactions.create(input, series);
      if (series.installments || series.fixed_months) {
        // A series lands on many rows/pages: refetch to show them all.
        await refresh();
      } else {
        // Prepend if it belongs on the current (first) page.
        if ((filters.page ?? 1) === 1) items = [res.data, ...items];
        pagination = { ...pagination, count: pagination.count + 1 };
      }
      return res.data;
    } catch (e) {
      error = errorMessage(e);
      throw e;
    }
  }

  /** Edit a transaction and swap the fresh server row in place. */
  async function update(id: number, input: Partial<TransactionInput>): Promise<Transaction> {
    error = null;
    try {
      const res = await api.transactions.update(id, input);
      items = items.map((t) => (t.id === id ? res.data : t));
      return res.data;
    } catch (e) {
      error = errorMessage(e);
      throw e;
    }
  }

  async function remove(id: number, scope: DeleteScope = "one"): Promise<void> {
    if (scope !== "one") {
      // Series deletes touch rows beyond the current page: refetch.
      error = null;
      try {
        await api.transactions.remove(id, scope);
        await refresh();
      } catch (e) {
        error = errorMessage(e);
        throw e;
      }
      return;
    }

    const snapshot = items;
    items = items.filter((t) => t.id !== id); // optimistic
    pagination = { ...pagination, count: Math.max(0, pagination.count - 1) };
    try {
      await api.transactions.remove(id);
    } catch (e) {
      items = snapshot; // rollback
      error = errorMessage(e);
      throw e;
    }
  }

  /** Flip paid/pending in place (the "settle" one-click action). */
  async function togglePaid(transaction: Transaction): Promise<void> {
    const snapshot = items;
    items = items.map((t) => (t.id === transaction.id ? { ...t, paid: !t.paid } : t)); // optimistic
    try {
      const res = await api.transactions.update(transaction.id, { paid: !transaction.paid });
      items = items.map((t) => (t.id === transaction.id ? res.data : t));
    } catch (e) {
      items = snapshot; // rollback
      error = errorMessage(e);
      throw e;
    }
  }

  return {
    get items() {
      return items;
    },
    get pagination() {
      return pagination;
    },
    get filters() {
      return filters;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    refresh,
    applyFilters,
    setPage,
    create,
    update,
    remove,
    togglePaid
  };
}

export type TransactionsController = ReturnType<typeof useTransactions>;
