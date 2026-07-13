<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import type { CreditCard } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import { useCreditCards } from "$composables/useCreditCards.svelte";
  import { formatCurrency } from "$utils/formatting";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const cards = useCreditCards(data.creditCards);

  const accountOptions = $derived([
    { value: "", label: "— none —" },
    ...data.accounts.map((a) => ({ value: a.id, label: a.name }))
  ]);

  function accountName(id: number | null): string {
    return data.accounts.find((a) => a.id === id)?.name ?? "Not set";
  }

  let showForm = $state(false);
  let editing = $state<CreditCard | null>(null);
  let name = $state("");
  let creditLimit = $state("");
  let closingDay = $state(1);
  let dueDay = $state(10);
  let paymentAccountId = $state<number | "">("");

  function openCreate() {
    editing = null;
    name = "";
    creditLimit = "";
    closingDay = 1;
    dueDay = 10;
    paymentAccountId = "";
    showForm = true;
  }

  function openEdit(card: CreditCard) {
    editing = card;
    name = card.name;
    creditLimit = card.credit_limit;
    closingDay = card.closing_day;
    dueDay = card.due_day;
    paymentAccountId = card.payment_account_id ?? "";
    showForm = true;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const payload = {
      name,
      credit_limit: creditLimit || 0,
      closing_day: Number(closingDay),
      due_day: Number(dueDay),
      payment_account_id: paymentAccountId === "" ? null : Number(paymentAccountId)
    };
    try {
      if (editing) {
        await cards.update(editing.id, payload);
      } else {
        await cards.create(payload);
      }
      showForm = false;
    } catch {
      // error surfaced via cards.error
    }
  }
</script>

<svelte:head><title>Credit cards · Rianganizze</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-ink">Credit cards</h1>
    <p class="text-sm text-ink-muted">{cards.items.length} cards</p>
  </div>
  <Button onclick={openCreate}><Plus size={16} aria-hidden="true" />New card</Button>
</div>

{#if cards.error}
  <p class="mb-4 rounded-xl bg-expense/10 p-2 text-sm text-expense">{cards.error}</p>
{/if}

<div class="flex flex-col gap-3">
  {#each cards.items as card (card.id)}
    <div class="rounded-2xl border border-edge bg-surface p-5 shadow-xs">
      <div class="flex items-start justify-between">
        <div>
          <p class="font-medium text-ink">{card.name}</p>
          <p class="text-xs text-ink-muted">
            Closes day {card.closing_day} · due day {card.due_day} · pays from {accountName(card.payment_account_id)}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" onclick={() => openEdit(card)}>Edit</Button>
          <Button variant="ghost" size="sm" onclick={() => cards.remove(card.id)}>Archive</Button>
        </div>
      </div>
      <div class="mt-4 flex items-end justify-between">
        <div>
          <p class="text-xs text-ink-muted">Open invoice</p>
          <p class="text-lg font-semibold text-expense">{formatCurrency(card.open_invoice)}</p>
          <p class="text-xs text-ink-muted">{formatCurrency(card.available_limit)} available</p>
        </div>
        <a
          href="/credit_cards/{card.id}"
          class="rounded-xl bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-soft-ink hover:bg-brand-soft-hover"
        >
          View invoice
        </a>
      </div>
    </div>
  {:else}
    <p class="rounded-2xl border border-dashed border-edge p-10 text-center text-ink-muted">
      No credit cards yet. Create your first one.
    </p>
  {/each}
</div>

<Modal open={showForm} title={editing ? "Edit card" : "New card"} onclose={() => (showForm = false)}>
  <form class="flex flex-col gap-4" onsubmit={submit}>
    <Input label="Name" bind:value={name} placeholder="e.g. Nubank" required />
    <Input label="Credit limit" type="number" step="0.01" bind:value={creditLimit} placeholder="0.00" />
    <div class="flex gap-3">
      <Input label="Closing day" type="number" min="1" max="31" bind:value={closingDay} />
      <Input label="Due day" type="number" min="1" max="31" bind:value={dueDay} />
    </div>
    <Select label="Payment account" bind:value={paymentAccountId} options={accountOptions} />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" onclick={() => (showForm = false)}>Cancel</Button>
      <Button type="submit" loading={cards.saving}>{editing ? "Save" : "Create"}</Button>
    </div>
  </form>
</Modal>
