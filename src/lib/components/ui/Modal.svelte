<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    children: Snippet;
  }
  let { open, title, onclose, children }: Props = $props();

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") onclose();
  }
</script>

<svelte:window {onkeydown} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button class="absolute inset-0 bg-stone-950/40" aria-label="Close" onclick={onclose}></button>
    <div
      class="relative z-10 w-full max-w-lg rounded-2xl bg-surface p-6 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-ink">{title}</h2>
        <button
          class="cursor-pointer rounded-xl p-1.5 text-ink-muted transition duration-150 hover:bg-hover hover:text-ink-secondary"
          onclick={onclose}
        >
          <span class="sr-only">Close</span>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {@render children()}
    </div>
  </div>
{/if}
