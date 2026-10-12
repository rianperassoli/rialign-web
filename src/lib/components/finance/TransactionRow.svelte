<script lang="ts">
  import type { Transaction } from "$api/types";
  import Badge from "$components/ui/Badge.svelte";
  import { formatCurrency, formatDate, toDateInput } from "$utils/formatting";
  import { m } from "$lib/paraglide/messages";

  interface Props {
    transaction: Transaction;
    onedit?: (transaction: Transaction) => void;
    onremove?: (transaction: Transaction) => void;
    ontogglepaid?: (transaction: Transaction) => void;
  }
  let { transaction, onedit, onremove, ontogglepaid }: Props = $props();

  const isIncome = $derived(transaction.kind === "income");
  const overdue = $derived(!transaction.paid && transaction.date < toDateInput());
</script>

<tr class="border-b border-edge-subtle last:border-0 hover:bg-surface-subtle">
  <td class="px-4 py-3">
    <p class="font-medium text-ink">
      {transaction.description}
      {#if transaction.installment_number}
        <span class="ml-1 text-xs font-normal text-ink-muted">
          {transaction.installment_number}/{transaction.installment_total}
        </span>
      {/if}
    </p>
    <p class="text-xs text-ink-muted">
      {#if transaction.category}{transaction.category.name}{/if}
      {#if transaction.series_id && !transaction.installment_number}
        <span class="text-ink-muted">· {m.tx_fixed()}</span>
      {/if}
    </p>
  </td>
  <td class="px-4 py-3 text-sm {overdue ? 'font-medium text-expense' : 'text-ink-muted'}">
    {formatDate(transaction.date)}
  </td>
  <td class="px-4 py-3">
    {#if ontogglepaid}
      <button
        class="cursor-pointer"
        title={transaction.paid ? m.tx_mark_pending() : m.tx_mark_paid()}
        onclick={() => ontogglepaid?.(transaction)}
      >
        <Badge tone={transaction.paid ? "income" : overdue ? "expense" : "warning"}>
          {transaction.paid ? m.status_paid() : overdue ? m.status_overdue() : m.status_pending()}
        </Badge>
      </button>
    {:else}
      <Badge tone={transaction.paid ? "neutral" : "warning"}>
        {transaction.paid ? m.status_paid() : m.status_pending()}
      </Badge>
    {/if}
  </td>
  <td class="px-4 py-3 text-right font-semibold {isIncome ? 'text-income' : 'text-expense'}">
    {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
  </td>
  <td class="px-4 py-3 text-right">
    <div class="flex items-center justify-end gap-3">
      {#if onedit}
        <button class="text-xs text-ink-muted hover:text-ink" onclick={() => onedit?.(transaction)}>
          {m.action_edit()}
        </button>
      {/if}
      {#if onremove}
        <button class="text-xs text-ink-muted hover:text-expense" onclick={() => onremove?.(transaction)}>
          {m.action_delete()}
        </button>
      {/if}
    </div>
  </td>
</tr>
