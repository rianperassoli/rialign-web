<script lang="ts">
  import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ChartPie from "@lucide/svelte/icons/chart-pie";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Tag from "@lucide/svelte/icons/tag";
  import Upload from "@lucide/svelte/icons/upload";
  import Wallet from "@lucide/svelte/icons/wallet";
  import Logo from "$components/brand/Logo.svelte";
  import { m } from "$lib/paraglide/messages";

  const features = [
    { href: "/dashboard", icon: LayoutDashboard, title: m.about_overview_title(), body: m.about_overview_body() },
    { href: "/accounts", icon: Wallet, title: m.about_accounts_title(), body: m.about_accounts_body() },
    { href: "/credit_cards", icon: CreditCard, title: m.about_cards_title(), body: m.about_cards_body() },
    { href: "/transactions", icon: ArrowLeftRight, title: m.about_activity_title(), body: m.about_activity_body() },
    { href: "/categories", icon: Tag, title: m.about_categories_title(), body: m.about_categories_body() },
    { href: "/reports", icon: ChartPie, title: m.about_insights_title(), body: m.about_insights_body() },
    { href: "/import", icon: Upload, title: m.about_import_title(), body: m.about_import_body() }
  ];

  const values = [
    { key: "organization", label: m.about_value_organization(), body: m.about_value_organization_body() },
    { key: "clarity", label: m.about_value_clarity(), body: m.about_value_clarity_body() },
    { key: "alignment", label: m.about_value_alignment(), body: m.about_value_alignment_body() },
    { key: "balance", label: m.about_value_balance(), body: m.about_value_balance_body() }
  ] as const;
</script>

<svelte:head><title>{m.about_page_title()}</title></svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-10">
  <section class="flex flex-col gap-4 border-b border-edge pb-10">
    <Logo size={44} tagline />
    <p class="max-w-2xl text-lg leading-relaxed text-ink-secondary">{m.about_intro()}</p>
  </section>

  <section>
    <h1 class="mb-5 text-2xl font-bold text-ink">{m.about_features_heading()}</h1>
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {#each features as feature (feature.href)}
        <li>
          <a
            href={feature.href}
            class="group flex h-full gap-4 rounded-2xl border border-edge bg-surface p-5 shadow-xs transition duration-150 hover:border-brand-700/40 hover:bg-hover"
          >
            <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-ink">
              <feature.icon size={18} aria-hidden="true" />
            </span>
            <span class="flex flex-col">
              <span class="flex items-center gap-1.5 font-medium text-ink">
                {feature.title}
                <ArrowRight
                  size={14}
                  class="text-ink-muted opacity-0 transition duration-150 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
              <span class="mt-1 text-sm leading-relaxed text-ink-secondary">{feature.body}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section class="grid overflow-hidden rounded-lg bg-surface md:grid-cols-5">
    <!-- Brand panel: the white mark on green, as on the brand sheet. -->
    <div class="flex flex-col items-center justify-center gap-5 bg-brand-700 px-8 py-12 text-center md:col-span-2">
      <Logo variant="symbol" size={96} class="text-white" />
      <div>
        <p class="text-2xl font-semibold tracking-tight text-white">Rialign</p>
        <p class="mt-1 text-sm text-white/80">{m.brand_tagline()}</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 p-8 md:col-span-3 md:p-10">
      <h2 class="text-sm font-semibold tracking-wide text-brand-ink uppercase">{m.about_brand_heading()}</h2>
      <p class="text-xl leading-snug font-semibold text-ink">{m.about_brand_title()}</p>
      <p class="leading-relaxed text-ink-secondary">{m.about_brand_origin()}</p>
      <p class="leading-relaxed text-ink-secondary">{m.about_brand_name()}</p>
      <p class="leading-relaxed text-ink-secondary">{m.about_brand_symbol()}</p>

      <!-- The four values from the brand sheet, with its line-drawn glyphs. -->
      <ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each values as value (value.key)}
          <li class="flex flex-col gap-2 rounded-lg bg-surface-subtle p-5">
            <svg
              viewBox="0 0 32 32"
              width="24"
              height="24"
              class="text-brand-700"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              {#if value.key === "organization"}
                <g fill="currentColor" stroke="none">
                  <rect x="3" y="3" width="11" height="11" rx="2.5" />
                  <rect x="18" y="3" width="11" height="11" rx="2.5" />
                  <rect x="3" y="18" width="11" height="11" rx="2.5" />
                  <rect x="18" y="18" width="11" height="11" rx="2.5" />
                </g>
              {:else if value.key === "clarity"}
                <path d="M4 7H28M4 16H28M4 25H28" />
              {:else if value.key === "alignment"}
                <path d="M7 4V28M16 4V28M25 4V28" />
              {:else}
                <circle cx="16" cy="16" r="12" />
              {/if}
            </svg>
            <h3 class="font-medium text-ink">{value.label}</h3>
            <p class="text-sm leading-relaxed text-ink-secondary">{value.body}</p>
          </li>
        {/each}
      </ul>
    </div>
  </section>
</div>
