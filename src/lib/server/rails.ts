/**
 * Server-only configuration and helpers for talking to the Rails API directly
 * (used by the proxy route and by token-issuing auth actions).
 */
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";

export const API_URL = env.API_URL ?? "http://localhost:3000";
export const SESSION_COOKIE = env.SESSION_COOKIE ?? "rialign_session";

export function railsUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** httpOnly cookie holding the JWT. `secure` only in production. */
export function setSessionCookie(cookies: Cookies, token: string): void {
  cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    maxAge: 60 * 60 * 24 // 24h, matching the API's JWT expiry
  });
}

export function clearSessionCookie(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}
