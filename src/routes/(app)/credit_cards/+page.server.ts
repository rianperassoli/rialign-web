import { createApiClient } from "$api/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const api = createApiClient(fetch);
  const [cards, accounts] = await Promise.all([api.creditCards.list(), api.accounts.list()]);
  return { creditCards: cards.data, accounts: accounts.data };
};
