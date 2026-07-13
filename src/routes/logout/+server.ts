import { redirect } from "@sveltejs/kit";
import { clearSessionCookie } from "$lib/server/rails";
import type { RequestHandler } from "./$types";

// Native form POST from the navbar; clears the cookie and bounces to login.
export const POST: RequestHandler = ({ cookies }) => {
  clearSessionCookie(cookies);
  redirect(303, "/login");
};
