<script lang="ts">
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import Import from "@lucide/svelte/icons/upload";
  import LogOut from "@lucide/svelte/icons/log-out";
  import Settings from "@lucide/svelte/icons/settings";
  import Tag from "@lucide/svelte/icons/tag";
  import Wallet from "@lucide/svelte/icons/wallet";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import ThemeToggle from "$components/layout/ThemeToggle.svelte";

  const items = [
    { href: "/accounts", label: "Accounts", icon: Wallet },
    { href: "/credit_cards", label: "Cards", icon: CreditCard },
    { href: "/categories", label: "Categories", icon: Tag },
    { href: "/import", label: "Import", icon: Import }
  ];

  let open = $state(false);
  let menu = $state<HTMLDivElement>();

  // Any navigation closes the menu.
  afterNavigate(() => (open = false));

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") open = false;
  }

  function onpointerdown(e: PointerEvent) {
    if (open && menu && !menu.contains(e.target as Node)) open = false;
  }
</script>

<svelte:window {onkeydown} {onpointerdown} />

<div class="relative" bind:this={menu}>
  <button
    class="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition duration-150 hover:bg-hover"
    aria-haspopup="menu"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <Settings size={15} aria-hidden="true" />
  </button>

  {#if open}
    <div
      class="absolute right-0 z-50 mt-1 w-60 rounded-2xl border border-edge bg-surface p-1.5 shadow-lg"
      role="menu"
    >
      {#each items as item (item.href)}
        {@const active = page.url.pathname.startsWith(item.href)}
        <a
          href={item.href}
          role="menuitem"
          class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition duration-150 {active
            ? 'bg-brand-soft text-brand-soft-ink'
            : 'text-ink-secondary hover:bg-hover'}"
        >
          <item.icon size={15} aria-hidden="true" />
          {item.label}
        </a>
      {/each}

      <div class="my-1.5 border-t border-edge"></div>

      <div class="flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-ink-secondary">
        Theme
        <ThemeToggle />
      </div>

      <div class="my-1.5 border-t border-edge"></div>

      <form method="POST" action="/logout">
        <button
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-secondary transition duration-150 hover:bg-hover"
        >
          <LogOut size={15} aria-hidden="true" />
          Log out
        </button>
      </form>
    </div>
  {/if}
</div>
