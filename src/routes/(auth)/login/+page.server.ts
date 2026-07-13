import { fail, redirect } from "@sveltejs/kit";
import { ApiError, createApiClient } from "$api/client";
import { setSessionCookie } from "$lib/server/rails";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();
  if (user) redirect(303, "/dashboard");
};

export const actions: Actions = {
  default: async ({ request, fetch, cookies }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const api = createApiClient(fetch);
      const { data } = await api.authPayload("/auth/login", { email, password });
      setSessionCookie(cookies, data.token);
    } catch (e) {
      const error = e instanceof ApiError ? e.message : "Login failed";
      return fail(401, { email, error });
    }

    redirect(303, "/dashboard");
  }
};
