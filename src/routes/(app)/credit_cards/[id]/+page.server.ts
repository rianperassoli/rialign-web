import { ApiError, createApiClient } from "$api/client";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, url }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) error(404, "Credit card not found");

  const month = url.searchParams.get("month") ?? undefined;
  const api = createApiClient(fetch);
  try {
    const [card, invoice, accounts] = await Promise.all([
      api.creditCards.get(id),
      api.creditCards.invoice(id, month),
      api.accounts.list()
    ]);
    return { card: card.data, invoice: invoice.data, accounts: accounts.data };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) error(404, "Credit card not found");
    throw e;
  }
};
