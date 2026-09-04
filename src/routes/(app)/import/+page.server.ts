import { createApiClient } from "$api/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const api = createApiClient(fetch);
  // The account list is what tells us whether importing would destroy anything,
  // so the page can warn before the file is even picked.
  const [accounts, imports] = await Promise.all([api.accounts.list(), api.imports.list()]);

  return { accounts: accounts.data, imports: imports.data };
};
