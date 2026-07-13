/**
 * Reactive categories list with create / update / archive.
 */
import { ApiError, createApiClient } from "$api/client";
import type { Category, CategoryInput } from "$api/types";

function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.errors.join(", ") : "Something went wrong";
}

function sorted(items: Category[]): Category[] {
  return [...items].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

export function useCategories(initial: Category[]) {
  const api = createApiClient();

  let items = $state<Category[]>(sorted(initial));
  let error = $state<string | null>(null);
  let saving = $state(false);

  async function create(input: CategoryInput): Promise<Category> {
    saving = true;
    error = null;
    try {
      const res = await api.categories.create(input);
      items = sorted([...items, res.data]);
      return res.data;
    } catch (e) {
      error = errorMessage(e);
      throw e;
    } finally {
      saving = false;
    }
  }

  async function update(id: number, input: Partial<CategoryInput>): Promise<Category> {
    saving = true;
    error = null;
    try {
      const res = await api.categories.update(id, input);
      items = sorted(items.map((c) => (c.id === id ? res.data : c)));
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
    items = items.filter((c) => c.id !== id); // optimistic
    try {
      await api.categories.remove(id);
    } catch (e) {
      items = snapshot;
      error = errorMessage(e);
      throw e;
    }
  }

  return {
    get items() {
      return items;
    },
    get income() {
      return items.filter((c) => c.kind === "income");
    },
    get expense() {
      return items.filter((c) => c.kind === "expense");
    },
    get error() {
      return error;
    },
    get saving() {
      return saving;
    },
    create,
    update,
    remove
  };
}
