<script lang="ts">
  import type { Account } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import { formatCurrency } from "$utils/formatting";
  import { m } from "$lib/paraglide/messages";

  interface Props {
    account: Account;
    onremove?: (id: number) => void;
  }
  let { account, onremove }: Props = $props();

  const typeLabel: Record<string, string> = {
    checking: m.account_type_checking(),
    savings: m.account_type_savings(),
    cash: m.account_type_cash(),
    other: m.account_type_other()
  };
</script>

<div class="flex items-center gap-3 px-5 py-4">
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-medium text-ink">{account.name}</p>
    <p class="text-xs text-ink-muted">
      {typeLabel[account.account_type] ?? account.account_type}{account.exclude_from_total
        ? ` · ${m.account_not_counted()}`
        : ""}
    </p>
  </div>
  <p class="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatCurrency(account.current_balance)}</p>
  {#if onremove}
    <Button variant="ghost" size="sm" onclick={() => onremove?.(account.id)}>{m.action_archive()}</Button>
  {/if}
</div>
