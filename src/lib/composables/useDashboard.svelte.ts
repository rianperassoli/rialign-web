/**
 * Reactive dashboard summary. Seeded from SSR; re-fetches when the selected
 * month changes.
 */
import { ApiError, createApiClient } from "$api/client";
import type { Dashboard } from "$api/types";
import { currentMonthParam } from "$utils/formatting";

export function useDashboard(initial: Dashboard, initialMonth = currentMonthParam()) {
  const api = createApiClient();

  let data = $state<Dashboard>(initial);
  let month = $state(initialMonth);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function refresh(): Promise<void> {
    loading = true;
    error = null;
    try {
      const res = await api.dashboard.get(month);
      data = res.data;
    } catch (e) {
      error = e instanceof ApiError ? e.message : "Could not load dashboard";
    } finally {
      loading = false;
    }
  }

  async function setMonth(next: string): Promise<void> {
    if (next === month) return;
    month = next;
    await refresh();
  }

  return {
    get data() {
      return data;
    },
    get month() {
      return month;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    setMonth,
    refresh
  };
}
