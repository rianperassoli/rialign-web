<script lang="ts">
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
  import { formatCurrency, toDateInput } from "$utils/formatting";

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

  let description = $state(transaction?.description ?? "");
  let kind = $state<TransactionKind>(transaction?.kind ?? initialKind ?? "expense");
  let amount = $state<string | number>(transaction?.amount ?? "");
  let date = $state(transaction?.date ?? toDateInput());
  let paid = $state(transaction?.paid ?? true);
  let categoryId = $state<string | number>(transaction?.category?.id ?? "");
  let source = $state<string>(initialSource());
  let repeat = $state<"" | "installments" | "fixed">("");
  let occurrences = $state(12);

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
    ...accounts.map((a) => ({ value: `account:${a.id}`, label: `${a.name} (account)` })),
    ...(kind === "expense" ? creditCards.map((c) => ({ value: `card:${c.id}`, label: `${c.name} (card)` })) : [])
  ]);

  function validate(): string[] {
    const e: string[] = [];
    if (!description.trim()) e.push("Description is required.");
    if (!amount || Number(amount) <= 0) e.push("Amount must be greater than 0.");
    if (!categoryId) e.push("Select a category.");
    if (!source) e.push("Select an account or credit card.");
    if (repeat && (!Number.isInteger(Number(occurrences)) || occurrences < 2 || occurrences > 60)) {
      e.push("Repeat between 2 and 60 times.");
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
      errors = err instanceof Error && "errors" in err ? (err as { errors: string[] }).errors : ["Could not save."];
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
          {k}
        </button>
      {/each}
    </div>
  {/if}

  <Input label="Description" bind:value={description} placeholder="e.g. Groceries" required />

  <div class="grid grid-cols-2 gap-3">
    <Input label="Amount" type="number" step="0.01" min="0" bind:value={amount} placeholder="0.00" required />
    <Input label="Date" type="date" bind:value={date} required />
  </div>

  <Select
    label="Category"
    bind:value={categoryId}
    placeholder="Select a category"
    options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
  />

  <Select label="Account / Card" bind:value={source} options={sourceOptions} />

  {#if !transaction}
    <div class="grid grid-cols-2 gap-3">
      <Select
        label="Repeat"
        bind:value={repeat}
        options={[
          { value: "", label: "One-time" },
          { value: "installments", label: "Installments (split total)" },
          { value: "fixed", label: "Fixed monthly (same amount)" }
        ]}
      />
      {#if repeat}
        <Input label="Times" type="number" min="2" max="60" bind:value={occurrences} />
      {/if}
    </div>
    {#if perInstallment}
      <p class="-mt-2 text-xs text-ink-muted">
        {occurrences} monthly installments of {formatCurrency(perInstallment)}
      </p>
    {:else if repeat === "fixed"}
      <p class="-mt-2 text-xs text-ink-muted">Repeats this amount every month; future months start as pending.</p>
    {/if}
  {:else if transaction.series_id}
    <p class="-mt-1 text-xs text-ink-muted">
      This is part of a {transaction.installment_total
        ? `${transaction.installment_total}x installment plan`
        : "monthly series"} — your changes apply to this occurrence only.
    </p>
  {/if}

  <label class="flex items-center gap-2 text-sm text-ink-secondary">
    <input type="checkbox" bind:checked={paid} class="rounded border-edge text-brand-600" />
    Already paid / settled
  </label>

  <div class="flex justify-end gap-2 pt-2">
    {#if oncancel}
      <Button type="button" variant="secondary" onclick={oncancel}>Cancel</Button>
    {/if}
    <Button type="submit" variant={kind === "expense" ? "expense" : "income"} loading={submitting}>
      {transaction ? "Save changes" : `Save ${kind}`}
    </Button>
  </div>
</form>
