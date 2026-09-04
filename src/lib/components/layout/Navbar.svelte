<script lang="ts">
  import { page } from "$app/state";
  import UserMenu from "$components/layout/UserMenu.svelte";

  // Day-to-day navigation only; setup lives in the Manage menu.
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/transactions", label: "Activity" },
    { href: "/reports", label: "Insights" }
  ];
</script>

<header class="border-b border-edge bg-surface">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <div class="flex items-center gap-8">
      <a href="/dashboard" class="text-lg font-semibold tracking-tight text-brand-700">Rialign</a>
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
