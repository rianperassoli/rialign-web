<script lang="ts">
  import LogOut from "@lucide/svelte/icons/log-out";
  import { page } from "$app/state";
  import ThemeToggle from "$components/layout/ThemeToggle.svelte";

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/reports", label: "Reports" },
    { href: "/accounts", label: "Accounts" },
    { href: "/credit_cards", label: "Cards" },
    { href: "/categories", label: "Categories" }
  ];
</script>

<header class="border-b border-edge bg-surface">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <div class="flex items-center gap-8">
      <a href="/dashboard" class="text-lg font-semibold tracking-tight text-brand-700">Rianganizze</a>
      <ul class="flex gap-1">
        {#each links as link (link.href)}
          {@const active = page.url.pathname.startsWith(link.href)}
          <li>
            <a
              href={link.href}
              class="rounded-xl px-3 py-2 text-sm font-medium transition duration-150 {active
                ? 'bg-brand-soft text-brand-soft-ink'
                : 'text-ink-secondary hover:bg-hover'}"
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <div class="flex items-center gap-3">
      <ThemeToggle />
      <form method="POST" action="/logout">
        <button
          class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition duration-150 hover:bg-hover"
        >
          <LogOut size={15} aria-hidden="true" />
          Log out
        </button>
      </form>
    </div>
  </nav>
</header>
