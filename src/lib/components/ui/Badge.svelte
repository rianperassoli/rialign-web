<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    tone?: "neutral" | "income" | "expense" | "warning";
    children: Snippet;
  }
  let { tone = "neutral", children }: Props = $props();

  const tones: Record<string, string> = {
    neutral: "bg-surface-subtle text-ink-secondary",
    income: "bg-income/15 text-income",
    expense: "bg-expense/15 text-expense",
    warning: "bg-warning/15 text-warning"
  };
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {tones[tone]}">
  {@render children()}
</span>
