<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    class?: string;
    header?: Snippet;
    children: Snippet;
  }
  let { title, class: klass = "", header, children }: Props = $props();
</script>

<section class="rounded-2xl border border-edge bg-surface p-6 shadow-xs {klass}">
  {#if title || header}
    <header class="mb-4 flex items-center justify-between">
      {#if title}<h2 class="text-sm font-semibold text-ink-muted uppercase tracking-wide">{title}</h2>{/if}
      {#if header}{@render header()}{/if}
    </header>
  {/if}
  {@render children()}
</section>
