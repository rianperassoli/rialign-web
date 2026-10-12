<script lang="ts">
  /**
   * Rialign logo: four pieces aligned into an "R".
   * - `symbol`: the mark alone (favicon, tight spaces)
   * - `horizontal`: mark + wordmark side by side (navbar; with tagline on auth screens)
   * - `vertical`: mark above wordmark, optional tagline
   * The mark is drawn in `currentColor`, brand-700 by default; pass
   * `class="text-white"` to place it on a green background.
   */
  import { m } from "$lib/paraglide/messages";

  let {
    variant = "horizontal",
    size = 28,
    tagline = false,
    class: className = "text-brand-700"
  }: {
    variant?: "symbol" | "horizontal" | "vertical";
    size?: number;
    tagline?: boolean;
    class?: string;
  } = $props();
</script>

{#snippet mark()}
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="currentColor"
    class="shrink-0 {className}"
    aria-hidden="true"
  >
    <rect x="0" y="0" width="44" height="44" rx="8" />
    <rect x="0" y="56" width="44" height="44" rx="8" />
    <path d="M64 0H78A22 22 0 0 1 78 44H64A8 8 0 0 1 56 36V8A8 8 0 0 1 64 0Z" />
    <path d="M62 56H66A34 44 0 0 1 100 100H62A6 6 0 0 1 56 94V62A6 6 0 0 1 62 56Z" />
  </svg>
{/snippet}

{#if variant === "symbol"}
  <span class="inline-flex" role="img" aria-label="Rialign">{@render mark()}</span>
{:else if variant === "vertical"}
  <div class="flex flex-col items-center gap-3 text-center">
    {@render mark()}
    <div>
      <p class="font-semibold tracking-tight text-ink" style="font-size: {size * 0.6}px; line-height: 1.1">
        Rialign
      </p>
      {#if tagline}
        <p class="mt-1 text-sm text-brand-ink">{m.brand_tagline()}</p>
      {/if}
    </div>
  </div>
{:else}
  <span class="inline-flex items-center" style="gap: {Math.max(8, size * 0.3)}px">
    {@render mark()}
    <span class="flex flex-col">
      <span class="font-semibold tracking-tight text-ink" style="font-size: {size * 0.7}px; line-height: 1.1">
        Rialign
      </span>
      {#if tagline}
        <span class="text-brand-ink" style="font-size: {Math.max(12, size * 0.27)}px; margin-top: {size * 0.04}px">
          {m.brand_tagline()}
        </span>
      {/if}
    </span>
  </span>
{/if}
