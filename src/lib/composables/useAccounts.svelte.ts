/**
 * Reactive accounts list with optimistic create/remove.
 */
import { ApiError, createApiClient } from "$api/client";
import type { Account, AccountInput, TransferInput } from "$api/types";

function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.errors.join(", ") : "Something went wrong";
}

export function useAccounts(initial: Account[]) {
  const api = createApiClient();

  let items = $state<Account[]>(initial);
  let error = $state<string | null>(null);
  let saving = $state(false);

  async function create(input: AccountInput): Promise<Account> {
    saving = true;
    error = null;
    try {
      const res = await api.accounts.create(input);
      items = [...items, res.data].sort((a, b) => a.name.localeCompare(b.name));
      return res.data;
    } catch (e) {
      error = errorMessage(e);
      throw e;
    } finally {
      saving = false;
    }
  }

  async function remove(id: number): Promise<void> {
    const snapshot = items;
    items = items.filter((a) => a.id !== id); // optimistic
    try {
      await api.accounts.remove(id);
    } catch (e) {
      items = snapshot;
      error = errorMessage(e);
      throw e;
    }
  }

  // Move money between two accounts. The API writes both legs; we refetch so the
  // displayed balances reflect the new figures.
  async function transfer(input: TransferInput): Promise<void> {
    saving = true;
    error = null;
    try {
      await api.transfers.create(input);
      const res = await api.accounts.list();
      items = res.data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      error = errorMessage(e);
      throw e;
    } finally {
      saving = false;
    }
  }

  return {
    get items() {
      return items;
    },
    get error() {
      return error;
    },
    get saving() {
      return saving;
    },
    create,
    remove,
    transfer
  };
}
