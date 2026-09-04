<script lang="ts">
  import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
  import Minus from "@lucide/svelte/icons/minus";
  import Plus from "@lucide/svelte/icons/plus";
  import { untrack } from "svelte";
  import { createApiClient } from "$api/client";
  import type { SeriesOptions, TransactionInput, TransferInput } from "$api/types";
  import AccountCard from "$components/finance/AccountCard.svelte";
  import TransactionForm from "$components/finance/TransactionForm.svelte";
  import TransferForm from "$components/finance/TransferForm.svelte";
  import Card from "$components/ui/Card.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import { useDashboard } from "$composables/useDashboard.svelte";
  import { formatCurrency, formatMonth, parseMoney } from "$utils/formatting";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  // SSR seed, read once: from here on the composable owns this state and
  // refreshes it itself, so a later `data` must not clobber it.
  const dash = untrack(() => useDashboard(data.dashboard, data.month));
  const api = createApiClient();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  /* ---- Quick-action modals (Organizze-style: create in place, no navigation) ---- */
  type QuickAction = "expense" | "income" | "transfer";
  let quickModal = $state<QuickAction | null>(null);

  const quickActions = [
    { action: "expense" as QuickAction, label: "Expense", icon: Minus, tint: "text-expense" },
    { action: "income" as QuickAction, label: "Income", icon: Plus, tint: "text-income" },
    { action: "transfer" as QuickAction, label: "Transfer", icon: ArrowLeftRight, tint: "text-ink-secondary" }
  ];

  async function createTransaction(input: TransactionInput, series?: SeriesOptions) {
    await api.transactions.create(input, series);
    quickModal = null;
    await dash.refresh();
  }

  async function createTransfer(input: TransferInput) {
    await api.transfers.create(input);
    quickModal = null;
    await dash.refresh();
  }

  // Accounts flagged out of the total would show a balance the "Overall
  // balance" above them does not include — two numbers that refuse to add up.
  // They stay real and stay editable, just on /accounts.
  const countedAccounts = $derived(dash.data.accounts.filter((a) => !a.exclude_from_total));

  const invoicesTotal = $derived(dash.data.credit_cards.reduce((sum, c) => sum + parseMoney(c.open_invoice), 0));

  // Top spending categories for the month; the rest folds into "view all".
  const topCategories = $derived(dash.data.by_category.slice(0, 5));
  const maxCategory = $derived(Math.max(1, ...topCategories.map((c) => parseMoney(c.total))));
</script>

<svelte:head><title>Dashboard · Rialign</title></svelte:head>

<Card class="mb-6">
  <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p class="text-lg font-semibold text-ink">{greeting}, {data.user.name}!</p>
      <div class="mt-3 flex gap-8 text-sm">
        <div>
          <p class="text-xs text-ink-muted">Monthly income</p>
          <p class="font-semibold text-income">{formatCurrency(dash.data.totals.income)}</p>
        </div>
        <div>
          <p class="text-xs text-ink-muted">Monthly expenses</p>
          <p class="font-semibold text-expense">{formatCurrency(dash.data.totals.expense)}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <div class="w-full sm:w-auto">
        <p class="mb-2 text-center text-sm font-semibold text-ink-secondary">Quick access</p>
        <!-- On a phone the three actions split the full width; from sm: they
             go back to fixed-width tiles so they do not stretch absurdly. -->
        <div class="grid grid-cols-3 gap-2 sm:flex">
          {#each quickActions as action (action.action)}
            <button
              onclick={() => (quickModal = action.action)}
              class="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-edge p-3 text-xs font-medium text-ink-secondary transition duration-150 hover:bg-hover sm:w-20"
            >
              <action.icon size={18} class={action.tint} aria-hidden="true" />
              {action.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</Card>

<div class="grid gap-6 lg:grid-cols-2">
  <!-- Accounts column -->
  <div>
    <div class="mb-4 border-l-4 border-income pl-3">
      <p class="text-sm text-ink-muted">Overall balance</p>
      <p class="text-2xl font-semibold text-ink">{formatCurrency(dash.data.consolidated_balance)}</p>
    </div>

    <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">My accounts</h2>
    <div class="divide-y divide-edge-subtle overflow-hidden rounded-2xl border border-edge bg-surface shadow-xs">
      {#each countedAccounts as account (account.id)}
        <AccountCard {account} />
      {:else}
        <p class="px-5 py-4 text-sm text-ink-muted">No accounts yet.</p>
      {/each}
    </div>
    <a href="/accounts" class="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700">
      Manage accounts →
    </a>
  </div>

  <!-- Credit cards column -->
  <div>
    <div class="mb-4 border-l-4 border-expense pl-3">
      <p class="text-sm text-ink-muted">Invoices of {formatMonth(dash.data.period.from)}</p>
      <p class="text-2xl font-semibold text-ink">{formatCurrency(-invoicesTotal || 0)}</p>
    </div>

    <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">My cards</h2>
    <div class="flex flex-col gap-3">
      {#each dash.data.credit_cards as card (card.id)}
        <div class="rounded-2xl border border-edge bg-surface p-5 shadow-xs">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-ink">{card.name}</p>
              <p class="text-xs text-ink-muted">Closes day {card.closing_day}</p>
            </div>
            <a
              href="/credit_cards/{card.id}"
              class="rounded-xl bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-soft-ink hover:bg-brand-soft-hover"
            >
              View invoice
            </a>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-surface-subtle p-3 text-sm">
            <div>
              <p class="text-xs text-ink-muted">Available limit</p>
              <p class="font-semibold text-ink">{formatCurrency(card.available_limit)}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-ink-muted">To pay (day {card.due_day})</p>
              <p class="font-semibold text-expense">{formatCurrency(card.open_invoice)}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-ink-muted">Next invoice</p>
              <p class="font-semibold text-ink-secondary">{formatCurrency(card.next_invoice)}</p>
            </div>
          </div>
        </div>
      {:else}
        <p class="text-sm text-ink-muted">No credit cards yet.</p>
      {/each}
    </div>
    <a href="/credit_cards" class="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700">
      Manage cards →
    </a>
  </div>
</div>

<div class="mt-8 grid gap-6 lg:grid-cols-2">
  <Card title="Forecast (pending)">
    <dl class="space-y-2 text-sm">
      <div class="flex justify-between">
        <dt class="text-ink-muted">Expected income</dt>
        <dd class="font-medium text-income">{formatCurrency(dash.data.forecast.income)}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-ink-muted">Expected expenses</dt>
        <dd class="font-medium text-expense">{formatCurrency(dash.data.forecast.expense)}</dd>
      </div>
    </dl>
  </Card>

  {#if topCategories.length}
    <Card title="Top spending categories">
      <ul class="flex flex-col gap-2.5">
        {#each topCategories as cat (cat.category_id)}
          <li>
            <div class="mb-1 flex justify-between text-sm">
              <span class="text-ink-secondary">{cat.name}</span>
              <span class="font-medium text-ink">{formatCurrency(cat.total)}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-surface-subtle">
              <div
                class="h-full rounded-full"
                style="width: {(parseMoney(cat.total) / maxCategory) * 100}%; background-color: {cat.color ??
                  '#94a3b8'}"
              ></div>
            </div>
          </li>
        {/each}
      </ul>
      <a href="/reports" class="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700">
        View full reports →
      </a>
    </Card>
  {/if}
</div>

<Modal open={quickModal === "expense"} title="New expense" onclose={() => (quickModal = null)}>
  <TransactionForm
    initialKind="expense"
    categories={data.categories}
    accounts={dash.data.accounts}
    creditCards={dash.data.credit_cards}
    oncancel={() => (quickModal = null)}
    onsubmit={createTransaction}
  />
</Modal>

<Modal open={quickModal === "income"} title="New income" onclose={() => (quickModal = null)}>
  <TransactionForm
    initialKind="income"
    categories={data.categories}
    accounts={dash.data.accounts}
    creditCards={dash.data.credit_cards}
    oncancel={() => (quickModal = null)}
    onsubmit={createTransaction}
  />
</Modal>

<Modal open={quickModal === "transfer"} title="Transfer between accounts" onclose={() => (quickModal = null)}>
  <TransferForm accounts={dash.data.accounts} oncancel={() => (quickModal = null)} onsubmit={createTransfer} />
</Modal>
