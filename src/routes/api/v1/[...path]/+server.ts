/**
 * Catch-all proxy: forwards `/api/v1/*` to the Rails API, attaching the JWT
 * from the httpOnly session cookie as a Bearer token.
 *
 * This is the single seam where the browser/SSR client reaches the backend, so
 * the token stays server-side and the client code never handles it.
 */
import { railsUrl } from "$lib/server/rails";
import type { RequestHandler } from "./$types";

const HOP_BY_HOP = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "host", "content-length"]);

async function proxy(method: string, { params, url, request, locals }: Parameters<RequestHandler>[0]) {
  const target = railsUrl(`/api/v1/${params.path}${url.search}`);

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  }
  if (locals.token) headers.set("Authorization", `Bearer ${locals.token}`);

  const hasBody = method !== "GET" && method !== "HEAD" && method !== "DELETE";
  const res = await fetch(target, {
    method,
    headers,
    body: hasBody ? await request.text() : undefined
  });

  // Stream the body straight through, preserving status and content type.
  const body = res.status === 204 ? null : await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" }
  });
}

export const GET: RequestHandler = (event) => proxy("GET", event);
export const POST: RequestHandler = (event) => proxy("POST", event);
export const PUT: RequestHandler = (event) => proxy("PUT", event);
export const PATCH: RequestHandler = (event) => proxy("PATCH", event);
export const DELETE: RequestHandler = (event) => proxy("DELETE", event);
