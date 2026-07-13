/**
 * Reactive credit-cards list with create / update / archive and invoice payment.
 *
 * After paying an invoice the card's open invoice resets, so the card is
 * refetched to reflect the new figures.
 */
import { ApiError, createApiClient } from "$api/client";
import type { CreditCard, CreditCardInput, PayInvoiceInput } from "$api/types";

function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.errors.join(", ") : "Something went wrong";
}

export function useCreditCards(initial: CreditCard[]) {
  const api = createApiClient();

  let items = $state<CreditCard[]>([...initial].sort((a, b) => a.name.localeCompare(b.name)));
  let error = $state<string | null>(null);
  let saving = $state(false);

  async function create(input: CreditCardInput): Promise<CreditCard> {
    saving = true;
    error = null;
    try {
      const res = await api.creditCards.create(input);
      items = [...items, res.data].sort((a, b) => a.name.localeCompare(b.name));
      return res.data;
    } catch (e) {
      error = errorMessage(e);
      throw e;
    } finally {
      saving = false;
    }
  }

  async function update(id: number, input: Partial<CreditCardInput>): Promise<CreditCard> {
    saving = true;
    error = null;
    try {
      const res = await api.creditCards.update(id, input);
      items = items.map((c) => (c.id === id ? res.data : c));
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
      await api.creditCards.remove(id);
    } catch (e) {
      items = snapshot;
      error = errorMessage(e);
      throw e;
    }
  }

  async function payInvoice(id: number, payment: PayInvoiceInput = {}): Promise<void> {
    saving = true;
    error = null;
    try {
      await api.creditCards.payInvoice(id, payment);
      const res = await api.creditCards.list();
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
    update,
    remove,
    payInvoice
  };
}
