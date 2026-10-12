<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import { getLocale, locales, setLocale, type Locale } from "$lib/paraglide/runtime";

  // Short code on the button, full name for screen readers and the tooltip.
  const label: Record<Locale, { short: string; full: string }> = {
    "en-US": { short: "EN", full: m.language_english() },
    "pt-BR": { short: "PT", full: m.language_portuguese() }
  };

  // Read once: `setLocale` writes the cookie and reloads, so the active locale
  // never changes underneath a mounted component.
  const active = getLocale();
</script>

<div class="flex items-center gap-0.5 rounded-xl bg-surface-subtle p-0.5" role="group" aria-label={m.menu_language()}>
  {#each locales as locale (locale)}
    <button
      onclick={() => setLocale(locale)}
      class="cursor-pointer rounded-[10px] px-2 py-1 text-xs font-semibold transition duration-150 {locale === active
        ? 'bg-surface text-ink shadow-xs'
        : 'text-ink-muted hover:text-ink-secondary'}"
      title={label[locale].full}
      aria-label={label[locale].full}
      aria-pressed={locale === active}
    >
      {label[locale].short}
    </button>
  {/each}
</div>
