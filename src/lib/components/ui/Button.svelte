<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "income" | "expense" | "neutral";
    size?: "sm" | "md";
    loading?: boolean;
    children: Snippet;
  }

  let { variant = "primary", size = "md", loading = false, disabled, children, ...rest }: Props = $props();

  const variants: Record<string, string> = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 focus-visible:outline-brand-700",
    secondary: "bg-transparent text-ink-secondary ring-1 ring-edge hover:bg-hover",
    ghost: "bg-transparent text-ink-secondary hover:bg-hover",
    danger: "bg-expense text-white hover:bg-red-600 active:bg-red-700",
    /* Money-flow semantics: expense actions are red, income actions green, transfers neutral. */
    expense: "bg-expense text-white hover:bg-red-600 active:bg-red-700",
    income: "bg-income text-white hover:bg-green-600 active:bg-green-700",
    neutral: "bg-ink text-app hover:opacity-85 active:opacity-75"
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm font-medium"
  };
</script>

<button
  class="inline-flex items-center justify-center gap-2 rounded-xl transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 {variants[
    variant
  ]} {sizes[size]}"
  disabled={disabled || loading}
  {...rest}
>
  {#if loading}
    <span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"
    ></span>
  {/if}
  {@render children()}
</button>
