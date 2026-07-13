/**
 * Lightweight auth state. The source of truth is the httpOnly session cookie
 * (read server-side); this composable just exposes the user resolved during
 * SSR to components reactively. Login/register/logout are server form actions.
 */
import type { User } from "$api/types";

export function useAuth(initialUser: User | null) {
  let user = $state<User | null>(initialUser);

  return {
    get user() {
      return user;
    },
    get isAuthenticated() {
      return user !== null;
    },
    set(next: User | null) {
      user = next;
    }
  };
}
