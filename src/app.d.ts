import type { User } from "$api/types";

declare global {
  namespace App {
    interface Locals {
      /** JWT pulled from the session cookie, if present. */
      token: string | null;
      /** Authenticated user resolved in the root layout load, if any. */
      user: User | null;
    }
    interface PageData {
      user?: User | null;
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {};
