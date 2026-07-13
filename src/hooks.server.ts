/**
 * Reads the JWT from the session cookie into `locals.token` for every request,
 * so the proxy route and load functions can authenticate against Rails.
 */
import { SESSION_COOKIE } from "$lib/server/rails";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.token = event.cookies.get(SESSION_COOKIE) ?? null;
  event.locals.user = null;
  return resolve(event);
};
