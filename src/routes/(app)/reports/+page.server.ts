import { createApiClient } from "$api/client";
import type { PageServerLoad } from "./$types";

const ALLOWED_WINDOWS = [3, 6, 12];

export const load: PageServerLoad = async ({ fetch, url }) => {
  const api = createApiClient(fetch);
  const requested = Number(url.searchParams.get("months"));
  const months = ALLOWED_WINDOWS.includes(requested) ? requested : 6;

  const report = await api.reports.get(months);
  return { report: report.data, months };
};
