<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$components/brand/Logo.svelte";
  import UserMenu from "$components/layout/UserMenu.svelte";
  import { m } from "$lib/paraglide/messages";

  // Day-to-day navigation only; setup lives in the Manage menu.
  const links = [
    { href: "/dashboard", label: m.nav_overview() },
    { href: "/transactions", label: m.nav_activity() },
    { href: "/reports", label: m.nav_insights() }
  ];
</script>

<header class="border-b border-edge bg-surface">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <div class="flex items-center gap-4 sm:gap-8">
      <!-- Symbol only on phones, so the links still fit on one line. -->
      <a href="/dashboard" aria-label="Rialign" class="rounded-lg">
        <span class="sm:hidden"><Logo variant="symbol" size={26} /></span>
        <span class="hidden sm:inline"><Logo size={26} /></span>
      </a>
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

    <UserMenu />
  </nav>
</header>
