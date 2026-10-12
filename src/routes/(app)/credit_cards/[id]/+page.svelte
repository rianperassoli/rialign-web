<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Plus from "@lucide/svelte/icons/plus";
  import Search from "@lucide/svelte/icons/search";
  import { goto, invalidateAll } from "$app/navigation";
  import { ApiError, createApiClient } from "$api/client";
  import type { Transaction, TransactionInput } from "$api/types";
  import TransactionForm from "$components/finance/TransactionForm.svelte";
  import Badge from "$components/ui/Badge.svelte";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import {
    currentMonthParam,
    formatCurrency,
    formatDate,
    formatMonth,
    parseMoney,
    toDateInput
  } from "$utils/formatting";
  import type { PageData } from "./$types";
  import { m } from "$lib/paraglide/messages";

  let { data }: { data: PageData } = $props();
  const api = createApiClient();

  const card = $derived(data.card);
  const invoice = $derived(data.invoice);

  const statusTone = { open: "warning", closed: "expense", paid: "income" } as const;
  const statusLabel = {
    open: m.invoice_status_open(),
    closed: m.invoice_status_closed(),
    paid: m.invoice_status_paid()
  } as const;
  const isCurrent = $derived(invoice.month === currentMonthParam());

  function shiftMonth(delta: number) {
    const year = Number(invoice.month.slice(0, 4));
    const month = Number(invoice.month.slice(5, 7));
    const target = currentMonthParam(new Date(year, month - 1 + delta, 1));
    void goto(`/credit_cards/${card.id}?month=${target}`);
  }

  /* ---- Charges filter ---- */
  let filter = $state("");
  const visibleTransactions = $derived.by(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return invoice.transactions;
    return invoice.transactions.filter(
      (t) => t.description.toLowerCase().includes(term) || (t.category?.name.toLowerCase().includes(term) ?? false)
    );
  });

  /* ---- Edit charge modal ---- */
  let editing = $state<Transaction | null>(null);

  async function saveCharge(id: number, input: TransactionInput) {
    await api.transactions.update(id, input);
    editing = null;
    await invalidateAll();
  }

  /* ---- Pay invoice modal ---- */
  const accountOptions = $derived(data.accounts.map((a) => ({ value: a.id, label: a.name })));
  let payOpen = $state(false);
  let payAccountId = $state<number | "">("");
  let payDate = $state(toDateInput());
  let paying = $state(false);
  let payError = $state<string | null>(null);

  function openPayModal() {
    payAccountId = card.payment_account_id ?? "";
    payDate = toDateInput();
    payError = null;
    payOpen = true;
  }

  async function confirmPayInvoice(event: SubmitEvent) {
    event.preventDefault();
    if (payAccountId === "") return;

    paying = true;
    payError = null;
    try {
      await api.creditCards.payInvoice(card.id, {
        month: invoice.month,
        date: payDate,
        account_id: Number(payAccountId)
      });
      payOpen = false;
      await invalidateAll();
    } catch (err) {
      payError = err instanceof ApiError ? err.errors.join(", ") : "Could not pay the invoice.";
    } finally {
      paying = false;
    }
  }
</script>

<svelte:head>
  <title>{m.invoice_page_title({ card: card.name, month: formatMonth(invoice.month) })}</title>
</svelte:head>

<div class="flex items-start gap-4">
  <!-- Floating month navigation (Organizze-style side arrows) -->
  <button
    class="hidden size-11 shrink-0 items-center justify-center self-center rounded-full bg-surface text-ink-muted shadow-sm hover:text-ink md:flex"
    onclick={() => shiftMonth(-1)}
    aria-label={m.invoice_prev_month()}
  >
    <ChevronLeft size={20} aria-hidden="true" />
  </button>

  <div class="min-w-0 flex-1 rounded-2xl border border-edge bg-surface p-6 shadow-xs sm:p-8">
    <a
      href="/credit_cards"
      class="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
    >
      <ArrowLeft size={13} aria-hidden="true" />
      {m.invoice_back_to_cards()}
    </a>

    <!-- Card header -->
    <div class="mt-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span
          class="flex size-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white"
          aria-hidden="true"
        >
          {card.name.slice(0, 1).toUpperCase()}
        </span>
        <p class="text-lg font-semibold text-ink">{card.name}</p>
        {#if isCurrent}
          <span class="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {m.invoice_current()}
          </span>
        {:else}
          <Badge tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Badge>
        {/if}
      </div>
      <!-- Mobile month navigation -->
      <div class="flex items-center gap-1 md:hidden">
        <Button variant="ghost" size="sm" onclick={() => shiftMonth(-1)} aria-label={m.invoice_prev_month()}>
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="sm" onclick={() => shiftMonth(1)} aria-label={m.invoice_next_month()}>
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>

    <!-- Invoice title -->
    <h1 class="mt-5 border-b border-edge pb-3 text-2xl text-ink-secondary">
      {m.invoice_heading()} <span class="font-bold text-ink">{formatMonth(invoice.month)}</span>
    </h1>

    <!-- Summary boxes -->
    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-edge p-4">
        <dl class="space-y-2 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{m.invoice_total()}</dt>
            <dd class="font-medium text-ink">{formatCurrency(-parseMoney(invoice.total) || 0)}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{m.invoice_pending()}</dt>
            <dd class="font-medium text-ink">{formatCurrency(-parseMoney(invoice.pending) || 0)}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{m.invoice_closing()}</dt>
            <dd class="font-medium text-ink">{formatDate(invoice.closing_date)}</dd>
          </div>
        </dl>
      </div>

      <div class="flex flex-col items-center justify-center rounded-2xl border border-edge p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{m.invoice_due_date()}</p>
        <p class="mt-1 text-xl font-semibold text-ink">{formatDate(invoice.due_date)}</p>
      </div>

      <div class="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-edge p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{m.invoice_amount()}</p>
        <p class="text-xl font-semibold text-ink">{formatCurrency(-parseMoney(invoice.total) || 0)}</p>
        {#if Number(invoice.pending) > 0}
          <button
            class="rounded-full bg-income px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
            onclick={openPayModal}
          >
            {m.invoice_pay()}
          </button>
        {:else if invoice.status === "paid"}
          <Badge tone="income">{m.invoice_status_paid()}</Badge>
        {/if}
      </div>
    </div>

    <!-- Charges -->
    <div class="mt-8 flex items-center gap-3">
      <h2 class="text-lg font-semibold text-ink">{m.invoice_charges()}</h2>
      <a
        href="/transactions"
        class="flex size-8 items-center justify-center rounded-full bg-expense text-white transition duration-150 hover:opacity-90"
        aria-label={m.invoice_new_charge()}
      >
        <Plus size={16} aria-hidden="true" />
      </a>
      <span class="ml-auto text-xs text-ink-muted">
        {m.invoice_count_of({ shown: visibleTransactions.length, total: invoice.transactions.length })}
      </span>
    </div>

    <div class="relative mt-4">
      <input
        type="search"
        bind:value={filter}
        placeholder={m.invoice_filter_placeholder()}
        class="w-full rounded-full border-none bg-surface-subtle py-2.5 pl-5 pr-11 text-sm text-ink-secondary placeholder:text-ink-muted focus:ring-2 focus:ring-brand-300"
        aria-label={m.invoice_filter_label()}
      />
      <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true">
        <Search size={16} />
      </span>
    </div>

    <ul class="mt-2 divide-y divide-edge-subtle">
      {#each visibleTransactions as t (t.id)}
        <li class="flex items-center gap-4 py-3.5 text-sm">
          <span class="w-12 shrink-0 text-xs text-ink-muted">{formatDate(t.date)}</span>
          <span class="min-w-0 flex-1 truncate font-medium text-ink">
            {t.description}
            {#if t.installment_number}
              <span class="text-xs font-normal text-ink-muted">{t.installment_number}/{t.installment_total}</span>
            {/if}
          </span>
          <span class="hidden shrink-0 items-center gap-2 text-ink-muted sm:flex">
            <span
              class="size-2.5 rounded-full"
              style="background-color: {t.category?.color ?? '#94a3b8'}"
              aria-hidden="true"
            ></span>
            {t.category?.name ?? m.invoice_uncategorized()}
          </span>
          <span class="shrink-0 font-medium text-ink">{formatCurrency(-parseMoney(t.amount) || 0)}</span>
          <button
            class="shrink-0 rounded-xl p-1.5 text-ink-muted transition duration-150 hover:bg-hover hover:text-ink"
            onclick={() => (editing = t)}
            aria-label={m.invoice_edit_charge()}
            title={m.invoice_edit_charge()}
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
        </li>
      {:else}
        <li class="py-10 text-center text-sm text-ink-muted">
          {invoice.transactions.length ? m.invoice_no_match() : m.invoice_no_charges()}
        </li>
      {/each}
    </ul>
  </div>

  <button
    class="hidden size-11 shrink-0 items-center justify-center self-center rounded-full bg-surface text-ink-muted shadow-sm hover:text-ink md:flex"
    onclick={() => shiftMonth(1)}
    aria-label={m.invoice_next_month()}
  >
    <ChevronRight size={20} aria-hidden="true" />
  </button>
</div>

<Modal open={editing !== null} title={m.invoice_edit_charge()} onclose={() => (editing = null)}>
  {#if editing}
    {@const target = editing}
    <TransactionForm
      transaction={target}
      categories={data.categories}
      accounts={data.accounts}
      creditCards={data.creditCards}
      oncancel={() => (editing = null)}
      onsubmit={(input) => saveCharge(target.id, input)}
    />
  {/if}
</Modal>

<Modal open={payOpen} title={m.invoice_pay_title()} onclose={() => (payOpen = false)}>
  <form class="flex flex-col gap-4" onsubmit={confirmPayInvoice}>
    {#if payError}
      <p class="rounded-xl bg-expense/10 p-2 text-sm text-expense">{payError}</p>
    {/if}
    <div class="flex gap-3">
      <Input label={m.field_amount()} value={formatCurrency(invoice.pending)} readonly />
      <Input label={m.field_date()} type="date" bind:value={payDate} required />
    </div>
    <Select
      label={m.field_account()}
      bind:value={payAccountId}
      options={accountOptions}
      placeholder={m.placeholder_select_account()}
      required
    />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" onclick={() => (payOpen = false)}>{m.action_cancel()}</Button>
      <Button type="submit" variant="income" loading={paying} disabled={payAccountId === ""}>{m.invoice_pay_submit()}</Button>
    </div>
  </form>
</Modal>
