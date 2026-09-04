<script lang="ts">
  import AlertTriangle from "@lucide/svelte/icons/triangle-alert";
  import Upload from "@lucide/svelte/icons/upload";
  import { onDestroy } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { createApiClient } from "$api/client";
  import type { Import, ImportSettings } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import Card from "$components/ui/Card.svelte";
  import Input from "$components/ui/Input.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const api = createApiClient(fetch);

  let file = $state<File | null>(null);
  let confirming = $state(false);
  let current = $state<Import | null>(null);
  let error = $state("");

  // Filled in step two, keyed by the name each account/card has in the file.
  let openFrom = $state("");
  let cardSettings = $state<Record<string, { closing_day: string; due_day: string; credit_limit: string }>>({});
  // Checked means "counts towards the total balance" — the common case, so
  // every account starts ticked and the user only unticks the exceptions.
  let counted = $state<Record<string, boolean>>({});
  // Polling outlives the page otherwise, and would call invalidateAll on a
  // route the user already left.
  let cancelled = false;
  onDestroy(() => (cancelled = true));

  const hasData = $derived(data.accounts.length > 0);
  const busy = $derived(current?.status === "pending" || current?.status === "analyzing");
  const writing = $derived(current?.status === "importing");
  const preview = $derived(current?.status === "awaiting_input" ? current.preview : null);

  // Every invoice named in the file, newest first — the answer to "which one
  // have you not paid yet?" is one of these.
  const invoiceMonths = $derived.by(() => {
    const all = (preview?.credit_cards ?? []).flatMap((c) => c.invoice_months);
    return [...new Set(all)].sort().reverse();
  });

  // Seeded once, when the analysis lands. Doing this in an $effect would mean
  // reading and writing the same state inside a reaction.
  function seedForm(analysed: Import) {
    const cards = analysed.preview.credit_cards ?? [];
    openFrom = [...new Set(cards.flatMap((c) => c.invoice_months))].sort().reverse()[0] ?? "";
    // Closing day is the one value the file knows; the other two are the
    // user's to fill in, and stay blank rather than pretending to a default.
    cardSettings = Object.fromEntries(
      cards.map((c) => [c.name, { closing_day: String(c.closing_day), due_day: "", credit_limit: "" }])
    );
    counted = Object.fromEntries((analysed.preview.accounts ?? []).map((a) => [a.name, true]));
  }

  function pick(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    file = input.files?.[0] ?? null;
    error = "";
    current = null;
  }

  function submit() {
    if (!file) return;
    if (hasData) confirming = true;
    else upload();
  }

  async function upload() {
    if (!file) return;
    confirming = false;
    error = "";
    try {
      const { data: started } = await api.imports.create(file);
      current = started;
      poll(started.id, "awaiting_input");
    } catch (err) {
      error = err instanceof Error ? err.message : "Upload failed.";
    }
  }

  async function confirmImport() {
    if (!current) return;
    error = "";
    const settings: ImportSettings = {
      open_from: openFrom || undefined,
      accounts: Object.fromEntries(
        Object.entries(counted)
          .filter(([, included]) => !included)
          .map(([name]) => [name, { exclude_from_total: true }])
      ),
      credit_cards: Object.fromEntries(
        (preview?.credit_cards ?? []).map((card) => [
          card.name,
          {
            closing_day: Number(cardSettings[card.name]?.closing_day) || card.closing_day,
            due_day: Number(cardSettings[card.name]?.due_day) || undefined,
            credit_limit: cardSettings[card.name]?.credit_limit || undefined
          }
        ])
      )
    };

    try {
      const { data: started } = await api.imports.confirm(current.id, settings);
      current = started;
      poll(started.id, "completed");
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not start the import.";
    }
  }

  // Both passes run outside the request, so the only way to learn the outcome
  // is to ask until the status stops moving.
  async function poll(id: number, until: Import["status"]) {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const { data: latest } = await api.imports.get(id);
        if (cancelled) return;
        current = latest;
        if (latest.status === "awaiting_input") seedForm(latest);
        if (latest.status === until || latest.status === "failed") break;
      } catch {
        error = "Lost track of the import. Reload to see where it landed.";
        break;
      }
    }
    if (current?.status === "completed") await invalidateAll();
  }

  const summary = $derived.by(() => {
    const r = current?.report ?? {};
    return [
      { label: "Transactions", value: r.imported ?? 0 },
      { label: "Accounts", value: r.accounts ?? 0 },
      { label: "Cards", value: r.credit_cards ?? 0 },
      { label: "Categories", value: r.categories ?? 0 }
    ];
  });

  const skipped = $derived.by(() => {
    const r = current?.report ?? {};
    return [
      { label: "zero amount", value: r.skipped_zero ?? 0 },
      { label: "credits on a card", value: r.skipped_card_credit ?? 0 },
      { label: "unreadable date", value: r.skipped_no_date ?? 0 }
    ].filter((row) => row.value > 0);
  });

  function monthLabel(month: string) {
    const [year, m] = month.split("-");
    return `${new Date(Number(year), Number(m) - 1).toLocaleString("en", { month: "long" })} ${year}`;
  }
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-6">
  <div>
    <h1 class="text-xl font-semibold text-ink">Import from Organizze</h1>
    <p class="mt-1 text-sm text-ink-secondary">
      Upload the <code class="rounded bg-hover px-1 py-0.5 text-xs">.xls</code> export from Organizze
      (Transactions → menu → export). Select all accounts, over the whole period.
    </p>
  </div>

  {#if !preview}
    {#if hasData}
      <Card>
        <div class="flex gap-3">
          <AlertTriangle size={18} class="mt-0.5 shrink-0 text-expense" aria-hidden="true" />
          <p class="text-sm text-ink-secondary">
            Importing <strong class="text-ink">replaces everything</strong> in this account — the
            {data.accounts.length} account{data.accounts.length === 1 ? "" : "s"} you have now, plus their
            cards, categories and transactions. The export is a full history, so merging it would duplicate
            every row.
          </p>
        </div>
      </Card>
    {/if}

    <Card>
      <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-1.5 text-sm font-medium text-ink-secondary">
          Export file
          <input
            type="file"
            accept=".xls,.xlsx"
            onchange={pick}
            disabled={busy}
            class="cursor-pointer rounded-xl border border-edge bg-surface px-3 py-2 text-sm text-ink disabled:cursor-not-allowed file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-hover file:px-3 file:py-1.5 file:text-sm file:text-ink-secondary"
          />
        </label>

        {#if error}
          <p class="rounded-xl bg-expense/10 p-3 text-sm text-expense">{error}</p>
        {/if}

        <div class="flex justify-end">
          <Button onclick={submit} disabled={!file || busy} loading={busy}>
            <Upload size={15} aria-hidden="true" />
            {busy ? "Reading the file…" : "Continue"}
          </Button>
        </div>
      </div>
    </Card>
  {/if}

  {#if preview}
    <Card>
      <h2 class="text-sm font-semibold text-ink">A few things the export does not say</h2>
      <p class="mt-1 text-sm text-ink-secondary">
        Nothing has been written yet. The closing day was read from the file; the rest is only in your
        head or on your statement.
      </p>

      {#if invoiceMonths.length}
        <div class="mt-5">
          <Select
            label="First invoice you have NOT paid yet"
            bind:value={openFrom}
            options={invoiceMonths.map((m) => ({ value: m, label: monthLabel(m) }))}
          />
          <p class="mt-1 text-xs text-ink-muted">
            Everything before it is imported as settled; this one and later stay open.
          </p>
        </div>
      {/if}

      {#each preview.credit_cards ?? [] as card (card.name)}
        {@const form = cardSettings[card.name]}
        <div class="mt-5 rounded-xl border border-edge p-3">
          <p class="text-sm font-medium text-ink">{card.name}</p>
          <p class="text-xs text-ink-muted">
            {card.rows.toLocaleString()} transactions · closing day {card.closing_day} read from the file
          </p>
          {#if form}
            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              <Input label="Closing day" type="number" min="1" max="31" bind:value={form.closing_day} />
              <Input label="Due day" type="number" min="1" max="31" placeholder="10" bind:value={form.due_day} />
              <Input
                label="Credit limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                bind:value={form.credit_limit}
              />
            </div>
            <p class="mt-2 text-xs text-ink-muted">
              Leave a field blank if you don't know it — you can set it later in Credit cards.
            </p>
          {/if}
        </div>
      {/each}

      <div class="mt-5">
        <p class="text-sm font-medium text-ink">Accounts</p>
        <p class="text-xs text-ink-muted">Untick any account that should not count towards your total balance.</p>
        <div class="mt-2 grid gap-1 sm:grid-cols-2">
          {#each preview.accounts ?? [] as account (account.name)}
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-secondary hover:bg-hover"
            >
              <input type="checkbox" bind:checked={counted[account.name]} class="cursor-pointer rounded border-edge" />
              <span class="flex-1 truncate">{account.name}</span>
              <span class="text-xs text-ink-muted">{account.rows.toLocaleString()}</span>
            </label>
          {/each}
        </div>
      </div>

      {#if error}
        <p class="mt-4 rounded-xl bg-expense/10 p-3 text-sm text-expense">{error}</p>
      {/if}

      <div class="mt-5 flex justify-end">
        <Button onclick={confirmImport} loading={writing} disabled={writing}>
          {writing ? "Importing…" : "Import"}
        </Button>
      </div>
    </Card>
  {/if}

  {#if current?.status === "completed"}
    <Card>
      <h2 class="text-sm font-semibold text-ink">Imported {current.filename}</h2>
      <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {#each summary as row (row.label)}
          <div class="rounded-xl bg-hover p-3">
            <dt class="text-xs text-ink-muted">{row.label}</dt>
            <dd class="text-lg font-semibold text-ink">{row.value}</dd>
          </div>
        {/each}
      </dl>
      {#if skipped.length}
        <p class="mt-3 text-xs text-ink-muted">
          Skipped rows this app cannot represent:
          {skipped.map((row) => `${row.value} with ${row.label}`).join(", ")}.
        </p>
      {/if}
    </Card>
  {:else if current?.status === "failed"}
    <Card>
      <h2 class="text-sm font-semibold text-expense">Import failed</h2>
      <p class="mt-1 text-sm text-ink-secondary">{current.error_message}</p>
      <p class="mt-2 text-xs text-ink-muted">Nothing was changed — the import runs all or nothing.</p>
    </Card>
  {/if}
</div>

<Modal open={confirming} title="Replace everything?" onclose={() => (confirming = false)}>
  <p class="text-sm text-ink-secondary">
    This deletes your {data.accounts.length} account{data.accounts.length === 1 ? "" : "s"}, along with
    their cards, categories and transactions, and loads
    <strong class="text-ink">{file?.name}</strong> in their place. It cannot be undone.
  </p>
  <div class="mt-5 flex justify-end gap-2">
    <Button variant="secondary" onclick={() => (confirming = false)}>Cancel</Button>
    <Button variant="expense" onclick={upload}>Replace and import</Button>
  </div>
</Modal>
