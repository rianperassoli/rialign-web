/**
 * Resolves the authenticated user once, server-side, from the session cookie.
 * Child layouts/pages read it via `await parent()` — no client refetch.
 */
import { createApiClient } from "$api/client";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, locals }) => {
  if (!locals.token) return { user: null };
  try {
    const api = createApiClient(fetch);
    const { data } = await api.auth.me();
    return { user: data };
  } catch {
    // Token expired or invalid — treat as logged out.
    return { user: null };
  }
};
