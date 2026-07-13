<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";

  interface Option {
    value: string | number;
    label: string;
  }
  interface Props extends HTMLSelectAttributes {
    label?: string;
    options: Option[];
    value?: string | number;
    placeholder?: string;
  }

  let { label, options, value = $bindable(""), placeholder, id, ...rest }: Props = $props();
  const selectId = id ?? `sel-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={selectId} class="text-sm font-medium text-ink-secondary">{label}</label>
  {/if}
  <select
    id={selectId}
    bind:value
    class="rounded-xl border-edge text-sm shadow-xs focus:border-brand-500 focus:ring-brand-500"
    {...rest}
  >
    {#if placeholder}
      <option value="">{placeholder}</option>
    {/if}
    {#each options as opt (opt.value)}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
</div>
