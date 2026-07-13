<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    label?: string;
    error?: string | null;
    value?: string | number;
  }

  let { label, error = null, value = $bindable(""), id, ...rest }: Props = $props();
  const inputId = id ?? `in-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={inputId} class="text-sm font-medium text-ink-secondary">{label}</label>
  {/if}
  <input
    id={inputId}
    bind:value
    class="rounded-xl border-edge text-sm shadow-xs focus:border-brand-500 focus:ring-brand-500 {error
      ? 'border-red-400'
      : ''}"
    aria-invalid={error ? "true" : undefined}
    {...rest}
  />
  {#if error}
    <p class="text-xs text-expense">{error}</p>
  {/if}
</div>
