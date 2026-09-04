<script lang="ts">
  import type { Account } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import { formatCurrency } from "$utils/formatting";

  interface Props {
    account: Account;
    onremove?: (id: number) => void;
  }
  let { account, onremove }: Props = $props();

  const typeLabel: Record<string, string> = {
    checking: "Checking",
    savings: "Savings",
    cash: "Cash",
    other: "Other"
  };
</script>

<div class="flex items-center gap-3 px-5 py-4">
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-medium text-ink">{account.name}</p>
    <p class="text-xs text-ink-muted">
      {typeLabel[account.account_type] ?? account.account_type}{account.exclude_from_total
        ? " · not counted towards the total"
        : ""}
    </p>
  </div>
  <p class="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatCurrency(account.current_balance)}</p>
  {#if onremove}
    <Button variant="ghost" size="sm" onclick={() => onremove?.(account.id)}>Archive</Button>
  {/if}
</div>
