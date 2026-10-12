<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { untrack } from "svelte";
  import type { Transaction, TransactionKind } from "$api/types";
  import TransactionForm from "$components/finance/TransactionForm.svelte";
  import TransactionList from "$components/finance/TransactionList.svelte";
  import Button from "$components/ui/Button.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import { useTransactions } from "$composables/useTransactions.svelte";
  import type { PageData } from "./$types";
  import { m } from "$lib/paraglide/messages";

  let { data }: { data: PageData } = $props();
  // SSR seed, read once: from here on the composable owns this state and
  // refreshes it itself, so a later `data` must not clobber it.
  const tx = untrack(() => useTransactions(data.transactions, data.filters));

  let showForm = $state(false);
  let editing = $state<Transaction | null>(null);
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
    } else if (confirm(m.activity_delete_confirm({ description: transaction.description }))) {
      tx.remove(transaction.id);
    }
  }

  async function deleteScoped(scope: "one" | "future" | "series") {
    if (!deleting) return;
    const id = deleting.id;
    deleting = null;
    await tx.remove(id, scope);
  }
  // Same seed rule as above: the filter fields are user-owned once mounted,
  // and filtering refreshes through `tx`, never through a new `data`.
  const filterSeed = untrack(() => ({
    search: data.filters.search ?? "",
    kind: data.filters.kind ?? "",
    paid: data.filters.paid === undefined ? "" : String(data.filters.paid)
  }));

  let search = $state(filterSeed.search);
  let kind = $state<string>(filterSeed.kind);
  let paid = $state<string>(filterSeed.paid);

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

<svelte:head><title>{m.activity_page_title()}</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <h1 class="text-2xl font-bold text-ink">{m.activity_heading()}</h1>
  <Button onclick={() => (showForm = true)}><Plus size={16} aria-hidden="true" />{m.activity_add()}</Button>
</div>

<div class="mb-4 flex flex-wrap items-end gap-3">
  <div class="flex flex-col gap-1">
    <label for="search" class="text-sm font-medium text-ink-secondary">{m.filter_search()}</label>
    <input
      id="search"
      bind:value={search}
      oninput={onSearchInput}
      placeholder={m.filter_search_placeholder()}
      class="rounded-xl border-edge text-sm shadow-xs focus:border-brand-500 focus:ring-brand-500"
    />
  </div>
  <Select
    label={m.field_type()}
    bind:value={kind}
    placeholder={m.filter_all_types()}
    onchange={onFilterChange}
    options={[
      { value: "income", label: m.kind_income() },
      { value: "expense", label: m.kind_expense() }
    ]}
  />
  <Select
    label={m.col_status()}
    bind:value={paid}
    placeholder={m.filter_all()}
    onchange={onFilterChange}
    options={[
      { value: "true", label: m.status_paid() },
      { value: "false", label: m.status_pending() }
    ]}
  />
  <div class="flex flex-col gap-1">
    <label for="month-filter" class="text-sm font-medium text-ink-secondary">{m.filter_month()}</label>
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
  onedit={(t) => (editing = t)}
  onremove={requestDelete}
  ontogglepaid={(t) => tx.togglePaid(t)}
/>

{#if tx.pagination.pages > 1}
  <div class="mt-4 flex items-center justify-center gap-2">
    <Button variant="secondary" size="sm" disabled={!tx.pagination.prev} onclick={() => tx.setPage(tx.pagination.prev!)}>
      {m.pager_previous()}
    </Button>
    <span class="text-sm text-ink-muted">
      {m.pager_page_of({ page: tx.pagination.page, pages: tx.pagination.pages })}
    </span>
    <Button variant="secondary" size="sm" disabled={!tx.pagination.next} onclick={() => tx.setPage(tx.pagination.next!)}>
      {m.pager_next()}
    </Button>
  </div>
{/if}

<Modal open={showForm} title={m.activity_new_modal()} onclose={() => (showForm = false)}>
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

<Modal open={editing !== null} title={m.activity_edit_modal()} onclose={() => (editing = null)}>
  {#if editing}
    {@const target = editing}
    <TransactionForm
      transaction={target}
      categories={data.categories}
      accounts={data.accounts}
      creditCards={data.creditCards}
      oncancel={() => (editing = null)}
      onsubmit={async (input) => {
        await tx.update(target.id, input);
        editing = null;
      }}
    />
  {/if}
</Modal>

<Modal open={deleting !== null} title={m.activity_delete_series_title()} onclose={() => (deleting = null)}>
  <p class="mb-4 text-sm text-ink-secondary">
    {deleting?.installment_total
      ? m.activity_delete_series_installments({
          description: deleting.description,
          count: deleting.installment_total
        })
      : m.activity_delete_series_fixed({ description: deleting?.description ?? "" })}
  </p>
  <div class="flex flex-col gap-2">
    <Button variant="secondary" onclick={() => deleteScoped("one")}>{m.activity_delete_one()}</Button>
    <Button variant="secondary" onclick={() => deleteScoped("future")}>{m.activity_delete_future()}</Button>
    <Button variant="danger" onclick={() => deleteScoped("series")}>{m.activity_delete_all()}</Button>
  </div>
</Modal>
