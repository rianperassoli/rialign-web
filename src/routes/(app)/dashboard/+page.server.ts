import { createApiClient } from "$api/client";
import { currentMonthParam } from "$utils/formatting";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
  const month = url.searchParams.get("month") ?? currentMonthParam();
  const api = createApiClient(fetch);
  // Categories feed the quick-action expense/income modals.
  const [dashboard, categories] = await Promise.all([api.dashboard.get(month), api.categories.list()]);
  return { dashboard: dashboard.data, categories: categories.data, month };
};
