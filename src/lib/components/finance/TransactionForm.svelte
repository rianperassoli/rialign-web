<script lang="ts">
  import { untrack } from "svelte";
  import type {
    Account,
    Category,
    CreditCard,
    SeriesOptions,
    Transaction,
    TransactionInput,
    TransactionKind
  } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import Select from "$components/ui/Select.svelte";
  import Toggle from "$components/ui/Toggle.svelte";
  import { formatCurrency, toDateInput } from "$utils/formatting";
  import { m } from "$lib/paraglide/messages";

  interface Props {
    categories: Category[];
    accounts: Account[];
    creditCards: CreditCard[];
    /** Returns a rejected promise (ApiError) to surface server-side errors. */
    onsubmit: (input: TransactionInput, series?: SeriesOptions) => Promise<unknown>;
    oncancel?: () => void;
    /** Preset the kind and hide the expense/income toggle (dedicated modals à la Organizze). */
    initialKind?: TransactionKind;
    /** When set, the form edits this transaction instead of creating a new one. */
    transaction?: Transaction;
  }
  let { categories, accounts, creditCards, onsubmit, oncancel, initialKind, transaction }: Props = $props();

  function initialSource(): string {
    if (transaction?.credit_card_id) return `card:${transaction.credit_card_id}`;
    if (transaction?.account_id) return `account:${transaction.account_id}`;
    return accounts[0] ? `account:${accounts[0].id}` : "";
  }

  // The modal mounts a fresh form on every open, so the props are read exactly
  // once, to seed fields the user then owns. `untrack` says that deliberately:
  // a later change to `transaction` must NOT overwrite what is being typed.
  const seed = untrack(() => ({
    description: transaction?.description ?? "",
    kind: (transaction?.kind ?? initialKind ?? "expense") as TransactionKind,
    amount: (transaction?.amount ?? "") as string | number,
    date: transaction?.date ?? toDateInput(),
    paid: transaction?.paid ?? true,
    categoryId: (transaction?.category?.id ?? "") as string | number,
    source: initialSource(),
    // Only a credit card leaves the question open: money moving through an
    // account is settled the moment it happens, so the toggle is hidden there
    // and paid is forced true. On a card the charge waits for the invoice, so
    // it starts off — until the user flips it themselves (editing starts
    // pinned to what was saved).
    paidPinned: Boolean(transaction)
  }));

  let description = $state(seed.description);
  let kind = $state<TransactionKind>(seed.kind);
  let amount = $state<string | number>(seed.amount);
  let date = $state(seed.date);
  let paid = $state(seed.paid);
  let categoryId = $state<string | number>(seed.categoryId);
  let source = $state<string>(seed.source);
  let repeat = $state<"" | "installments" | "fixed">("");
  let occurrences = $state(12);
  let paidPinned = $state(seed.paidPinned);

  let submitting = $state(false);
  let errors = $state<string[]>([]);

  // Per-installment preview so "1200 in 12x" reads as "12 × $100.00".
  const perInstallment = $derived(
    repeat === "installments" && Number(amount) > 0 && occurrences > 1 ? Number(amount) / occurrences : null
  );

  // Categories are scoped to the selected kind (matches the API invariant).
  const availableCategories = $derived(categories.filter((c) => c.kind === kind));

  // A credit card can only hold expenses, so income hides card options.
  const sourceOptions = $derived([
    ...accounts.map((a) => ({ value: `account:${a.id}`, label: m.source_account_suffix({ name: a.name }) })),
    ...(kind === "expense"
      ? creditCards.map((c) => ({ value: `card:${c.id}`, label: m.source_card_suffix({ name: c.name }) }))
      : [])
  ]);

  const onCard = $derived(source.startsWith("card:"));

  $effect(() => {
    if (!onCard) {
      paid = true;
      paidPinned = false;
    } else if (!paidPinned) {
      paid = false;
    }
  });

  function validate(): string[] {
    const e: string[] = [];
    if (!description.trim()) e.push(m.form_err_description());
    if (!amount || Number(amount) <= 0) e.push(m.form_err_amount());
    if (!categoryId) e.push(m.form_err_category());
    if (!source) e.push(m.form_err_source());
    if (repeat && (!Number.isInteger(Number(occurrences)) || occurrences < 2 || occurrences > 60)) {
      e.push(m.form_err_repeat());
    }
    return e;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errors = validate();
    if (errors.length) return;

    const [sourceType, sourceId] = source.split(":");
    const input: TransactionInput = {
      description: description.trim(),
      kind,
      amount,
      date,
      paid,
      category_id: Number(categoryId),
      account_id: sourceType === "account" ? Number(sourceId) : null,
      credit_card_id: sourceType === "card" ? Number(sourceId) : null
    };
    const series: SeriesOptions | undefined =
      repeat === "installments"
        ? { installments: Number(occurrences) }
        : repeat === "fixed"
          ? { fixed_months: Number(occurrences) }
          : undefined;

    submitting = true;
    try {
      await onsubmit(input, series);
    } catch (err) {
      errors = err instanceof Error && "errors" in err ? (err as { errors: string[] }).errors : [m.form_err_save()];
    } finally {
      submitting = false;
    }
  }
</script>

<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
  {#if errors.length}
    <ul class="rounded-xl bg-expense/10 p-3 text-sm text-expense">
      {#each errors as err (err)}<li>{err}</li>{/each}
    </ul>
  {/if}

  {#if !initialKind}
    <div class="flex gap-2">
      {#each ["expense", "income"] as const as k (k)}
        <button
          type="button"
          class="flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition duration-150 {kind === k
            ? k === 'expense'
              ? 'border-expense bg-expense/10 text-expense'
              : 'border-income bg-income/10 text-income'
            : 'border-edge text-ink-secondary hover:bg-hover'}"
          onclick={() => {
            kind = k;
            categoryId = "";
          }}
        >
          {k === "expense" ? m.kind_expense() : m.kind_income()}
        </button>
      {/each}
    </div>
  {/if}

  <Input
    label={m.field_description()}
    bind:value={description}
    placeholder={m.placeholder_transaction_description()}
    required
  />

  <div class="grid grid-cols-2 gap-3">
    <Input label={m.field_amount()} type="number" step="0.01" min="0" bind:value={amount} placeholder="0.00" required />
    <Input label={m.field_date()} type="date" bind:value={date} required />
  </div>

  {#if onCard}
    <Toggle bind:checked={paid} label={m.field_settled()} variant="expense" onchange={() => (paidPinned = true)} />
  {/if}

  <div class="grid grid-cols-2 gap-3">
    <Select label={m.field_account_or_card()} bind:value={source} options={sourceOptions} />
    <Select
      label={m.field_category()}
      bind:value={categoryId}
      placeholder={m.placeholder_select_category()}
      options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
    />
  </div>

  {#if !transaction}
    <div class="grid grid-cols-2 gap-3">
      <Select
        label={m.field_repeat()}
        bind:value={repeat}
        options={[
          { value: "", label: m.repeat_one_time() },
          { value: "installments", label: m.repeat_installments() },
          { value: "fixed", label: m.repeat_fixed() }
        ]}
      />
      {#if repeat}
        <Input label={m.field_times()} type="number" min="2" max="60" bind:value={occurrences} />
      {/if}
    </div>
    {#if perInstallment}
      <p class="-mt-2 text-xs text-ink-muted">
        {m.form_installments_preview({ count: occurrences, amount: formatCurrency(perInstallment) })}
      </p>
    {:else if repeat === "fixed"}
      <p class="-mt-2 text-xs text-ink-muted">{m.form_fixed_hint()}</p>
    {/if}
  {:else if transaction.series_id}
    <p class="-mt-1 text-xs text-ink-muted">
      {transaction.installment_total
        ? m.form_series_installments({ count: transaction.installment_total })
        : m.form_series_fixed()}
    </p>
  {/if}

  <div class="flex justify-end gap-2 pt-2">
    {#if oncancel}
      <Button type="button" variant="secondary" onclick={oncancel}>{m.action_cancel()}</Button>
    {/if}
    <Button type="submit" variant={kind === "expense" ? "expense" : "income"} loading={submitting}>
      {transaction ? m.form_save_changes() : kind === "expense" ? m.form_save_expense() : m.form_save_income()}
    </Button>
  </div>
</form>
