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

<div class="flex items-center justify-between rounded-2xl border border-edge bg-surface p-5 shadow-xs">
  <div>
    <p class="font-medium text-ink">{account.name}</p>
    <p class="text-xs text-ink-muted">{typeLabel[account.account_type] ?? account.account_type}</p>
  </div>
  <div class="flex items-center gap-4">
    <p class="text-lg font-semibold text-ink">{formatCurrency(account.current_balance)}</p>
    {#if onremove}
      <Button variant="ghost" size="sm" onclick={() => onremove?.(account.id)}>Archive</Button>
    {/if}
  </div>
</div>
