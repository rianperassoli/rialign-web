/**
 * Reads the JWT from the session cookie into `locals.token` for every request,
 * so the proxy route and load functions can authenticate against Rails.
 */
import { paraglideMiddleware } from "$lib/paraglide/server";
import { SESSION_COOKIE } from "$lib/server/rails";
import { getTextDirection } from "$lib/paraglide/runtime";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.token = event.cookies.get(SESSION_COOKIE) ?? null;
  event.locals.user = null;

  // Resolves the locale for this request and fills the %lang%/%dir%
  // placeholders in app.html.
  return paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace("%lang%", locale).replace("%dir%", getTextDirection(locale))
    });
  });
};
