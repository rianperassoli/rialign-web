import { createApiClient } from "$api/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const api = createApiClient(fetch);
  const { data } = await api.accounts.list();
  return { accounts: data };
};
