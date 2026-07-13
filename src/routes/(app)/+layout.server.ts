import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

// Guard: everything under (app) requires an authenticated user.
export const load: LayoutServerLoad = async ({ parent }) => {
  const { user } = await parent();
  if (!user) redirect(303, "/login");
  return { user };
};
