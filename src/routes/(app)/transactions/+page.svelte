<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import type { Transaction, TransactionKind } from "$api/types";
  import TransactionForm from "$components/finance/TransactionForm.svelte";
  import TransactionList from "$components/finance/TransactionList.svelte";
  import Button from "$components/ui/Button.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import { useTransactions } from "$composables/useTransactions.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const tx = useTransactions(data.transactions, data.filters);

  let showForm = $state(false);
  let deleting = $state<Transaction | null>(null);
  let month = $state("");

  function onMonthChange() {
    if (!month) {
      tx.applyFilters({ from: undefined, to: undefined });
      return;
    }
    const year = Number(month.slice(0, 4));
    const monthNumber = Number(month.slice(5, 7));
    const lastDay = new Date(year, monthNumber, 0).getDate();
    tx.applyFilters({ from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` });
  }

  function requestDelete(transaction: Transaction) {
    if (transaction.series_id) {
      deleting = transaction; // series: ask how much of it to remove
    } else if (confirm(`Delete "${transaction.description}"?`)) {
      tx.remove(transaction.id);
    }
  }

  async function deleteScoped(scope: "one" | "future" | "series") {
    if (!deleting) return;
    const id = deleting.id;
    deleting = null;
    await tx.remove(id, scope);
  }
  let search = $state(data.filters.search ?? "");
  let kind = $state<string>(data.filters.kind ?? "");
  let paid = $state<string>(data.filters.paid === undefined ? "" : String(data.filters.paid));

  let searchTimer: ReturnType<typeof setTimeout>;
  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => tx.applyFilters({ search: search || undefined }), 300);
  }

  function onFilterChange() {
    tx.applyFilters({
      kind: (kind || undefined) as TransactionKind | undefined,
      paid: paid === "" ? undefined : paid === "true"
    });
  }
</script>

<svelte:head><title>Transactions · Rianganizze</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <h1 class="text-2xl font-bold text-ink">Transactions</h1>
  <Button onclick={() => (showForm = true)}><Plus size={16} aria-hidden="true" />Add transaction</Button>
</div>

<div class="mb-4 flex flex-wrap items-end gap-3">
  <div class="flex flex-col gap-1">
    <label for="search" class="text-sm font-medium text-ink-secondary">Search</label>
    <input
      id="search"
      bind:value={search}
      oninput={onSearchInput}
      placeholder="Description…"
      class="rounded-xl border-edge text-sm shadow-xs focus:border-brand-500 focus:ring-brand-500"
    />
  </div>
  <Select
    label="Type"
    bind:value={kind}
    placeholder="All types"
    onchange={onFilterChange}
    options={[
      { value: "income", label: "Income" },
      { value: "expense", label: "Expense" }
    ]}
  />
  <Select
    label="Status"
    bind:value={paid}
    placeholder="All"
    onchange={onFilterChange}
    options={[
      { value: "true", label: "Paid" },
      { value: "false", label: "Pending" }
    ]}
  />
  <div class="flex flex-col gap-1">
    <label for="month-filter" class="text-sm font-medium text-ink-secondary">Month</label>
    <input
      id="month-filter"
      type="month"
      bind:value={month}
      onchange={onMonthChange}
      class="rounded-xl border-edge text-sm shadow-xs focus:border-brand-500 focus:ring-brand-500"
    />
  </div>
  {#if tx.error}
    <p class="ml-auto text-sm text-expense">{tx.error}</p>
  {/if}
</div>

<TransactionList
  transactions={tx.items}
  loading={tx.loading}
  onremove={requestDelete}
  ontogglepaid={(t) => tx.togglePaid(t)}
/>

{#if tx.pagination.pages > 1}
  <div class="mt-4 flex items-center justify-center gap-2">
    <Button variant="secondary" size="sm" disabled={!tx.pagination.prev} onclick={() => tx.setPage(tx.pagination.prev!)}>
      Previous
    </Button>
    <span class="text-sm text-ink-muted">Page {tx.pagination.page} of {tx.pagination.pages}</span>
    <Button variant="secondary" size="sm" disabled={!tx.pagination.next} onclick={() => tx.setPage(tx.pagination.next!)}>
      Next
    </Button>
  </div>
{/if}

<Modal open={showForm} title="New transaction" onclose={() => (showForm = false)}>
  <TransactionForm
    categories={data.categories}
    accounts={data.accounts}
    creditCards={data.creditCards}
    oncancel={() => (showForm = false)}
    onsubmit={async (input, series) => {
      await tx.create(input, series);
      showForm = false;
    }}
  />
</Modal>

<Modal open={deleting !== null} title="Delete recurring transaction" onclose={() => (deleting = null)}>
  <p class="mb-4 text-sm text-ink-secondary">
    "{deleting?.description}" is part of a
    {deleting?.installment_total ? `${deleting.installment_total}x installment plan` : "fixed monthly series"}.
    What do you want to delete?
  </p>
  <div class="flex flex-col gap-2">
    <Button variant="secondary" onclick={() => deleteScoped("one")}>Only this one</Button>
    <Button variant="secondary" onclick={() => deleteScoped("future")}>This and the following</Button>
    <Button variant="danger" onclick={() => deleteScoped("series")}>All of them</Button>
  </div>
</Modal>
