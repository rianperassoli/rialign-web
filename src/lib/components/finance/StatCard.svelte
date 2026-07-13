<script lang="ts">
  import type { Money } from "$api/types";
  import { formatCurrency } from "$utils/formatting";

  interface Props {
    label: string;
    value: Money;
    tone?: "neutral" | "income" | "expense";
  }
  let { label, value, tone = "neutral" }: Props = $props();

  const toneClass: Record<string, string> = {
    neutral: "text-ink",
    income: "text-income",
    expense: "text-expense"
  };
</script>

<div class="rounded-2xl border border-edge bg-surface p-5 shadow-xs">
  <p class="text-sm font-medium text-ink-muted">{label}</p>
  <p class="mt-1 text-2xl font-semibold {toneClass[tone]}">{formatCurrency(value)}</p>
</div>
