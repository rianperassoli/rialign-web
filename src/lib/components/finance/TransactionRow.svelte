<script lang="ts">
  import type { Transaction } from "$api/types";
  import Badge from "$components/ui/Badge.svelte";
  import { formatCurrency, formatDate, toDateInput } from "$utils/formatting";

  interface Props {
    transaction: Transaction;
    onremove?: (transaction: Transaction) => void;
    ontogglepaid?: (transaction: Transaction) => void;
  }
  let { transaction, onremove, ontogglepaid }: Props = $props();

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
        <span class="text-ink-muted">· fixed</span>
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
        title={transaction.paid ? "Mark as pending" : "Mark as paid"}
        onclick={() => ontogglepaid?.(transaction)}
      >
        <Badge tone={transaction.paid ? "income" : overdue ? "expense" : "warning"}>
          {transaction.paid ? "Paid" : overdue ? "Overdue" : "Pending"}
        </Badge>
      </button>
    {:else}
      <Badge tone={transaction.paid ? "neutral" : "warning"}>{transaction.paid ? "Paid" : "Pending"}</Badge>
    {/if}
  </td>
  <td class="px-4 py-3 text-right font-semibold {isIncome ? 'text-income' : 'text-expense'}">
    {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
  </td>
  <td class="px-4 py-3 text-right">
    {#if onremove}
      <button class="text-xs text-ink-muted hover:text-expense" onclick={() => onremove?.(transaction)}>
        Delete
      </button>
    {/if}
  </td>
</tr>
