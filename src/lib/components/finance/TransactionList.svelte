<script lang="ts">
  import type { Transaction } from "$api/types";
  import Skeleton from "$components/ui/Skeleton.svelte";
  import TransactionRow from "./TransactionRow.svelte";

  interface Props {
    transactions: Transaction[];
    loading?: boolean;
    onedit?: (transaction: Transaction) => void;
    onremove?: (transaction: Transaction) => void;
    ontogglepaid?: (transaction: Transaction) => void;
  }
  let { transactions, loading = false, onedit, onremove, ontogglepaid }: Props = $props();
</script>

<div class="overflow-hidden rounded-2xl border border-edge bg-surface shadow-xs">
  <table class="w-full text-left text-sm">
    <thead class="bg-surface-subtle text-xs uppercase tracking-wide text-ink-muted">
      <tr>
        <th class="px-4 py-3 font-medium">Description</th>
        <th class="px-4 py-3 font-medium">Date</th>
        <th class="px-4 py-3 font-medium">Status</th>
        <th class="px-4 py-3 text-right font-medium">Amount</th>
        <th class="px-4 py-3"></th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        {#each Array(5) as _, i (i)}
          <tr class="border-b border-edge-subtle last:border-0">
            <td class="px-4 py-3" colspan="5"><Skeleton class="h-5 w-full" /></td>
          </tr>
        {/each}
      {:else if transactions.length === 0}
        <tr>
          <td class="px-4 py-10 text-center text-ink-muted" colspan="5">No transactions found.</td>
        </tr>
      {:else}
        {#each transactions as transaction (transaction.id)}
          <TransactionRow {transaction} {onedit} {onremove} {ontogglepaid} />
        {/each}
      {/if}
    </tbody>
  </table>
</div>
