import { createApiClient } from "$api/client";
import type { TransactionFilters } from "$api/types";
import type { PageServerLoad } from "./$types";

function parseFilters(params: URLSearchParams): TransactionFilters {
  const filters: TransactionFilters = {};
  const kind = params.get("kind");
  if (kind === "income" || kind === "expense") filters.kind = kind;
  const search = params.get("search");
  if (search) filters.search = search;
  const paid = params.get("paid");
  if (paid === "true" || paid === "false") filters.paid = paid === "true";
  const page = Number(params.get("page"));
  if (Number.isFinite(page) && page > 0) filters.page = page;
  return filters;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  const api = createApiClient(fetch);
  const filters = parseFilters(url.searchParams);

  // Fetch list + the lookups the create form needs, in parallel.
  const [transactions, categories, accounts, creditCards] = await Promise.all([
    api.transactions.list(filters),
    api.categories.list(),
    api.accounts.list(),
    api.creditCards.list()
  ]);

  return {
    transactions,
    filters,
    categories: categories.data,
    accounts: accounts.data,
    creditCards: creditCards.data
  };
};
