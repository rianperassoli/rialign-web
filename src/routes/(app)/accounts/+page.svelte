<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { untrack } from "svelte";
  import type { AccountType } from "$api/types";
  import AccountCard from "$components/finance/AccountCard.svelte";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import { useAccounts } from "$composables/useAccounts.svelte";
  import { formatCurrency } from "$utils/formatting";
  import type { PageData } from "./$types";
  import { m } from "$lib/paraglide/messages";

  let { data }: { data: PageData } = $props();
  // SSR seed, read once: from here on the composable owns this state and
  // refreshes it itself, so a later `data` must not clobber it.
  const accounts = untrack(() => useAccounts(data.accounts));

  let showForm = $state(false);
  let name = $state("");
  let accountType = $state<AccountType>("checking");
  let initialBalance = $state("");

  // Same rule the dashboard and the API use: flagged accounts are listed here,
  // but they do not move the total.
  const counted = $derived(accounts.items.filter((a) => !a.exclude_from_total));
  const total = $derived(counted.reduce((sum, a) => sum + Number(a.current_balance), 0));

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    try {
      await accounts.create({ name, account_type: accountType, initial_balance: initialBalance || 0 });
      showForm = false;
      name = "";
      initialBalance = "";
    } catch {
      // error is surfaced via accounts.error below
    }
  }

  // --- Transfer between accounts ---
  let showTransfer = $state(false);
  let fromId = $state<number | "">("");
  let toId = $state<number | "">("");
  let transferAmount = $state("");
  let transferDescription = $state("");

  const accountOptions = $derived(accounts.items.map((a) => ({ value: a.id, label: a.name })));

  function openTransfer() {
    fromId = accounts.items[0]?.id ?? "";
    toId = accounts.items[1]?.id ?? "";
    transferAmount = "";
    transferDescription = "";
    showTransfer = true;
  }

  async function submitTransfer(event: SubmitEvent) {
    event.preventDefault();
    if (fromId === "" || toId === "") return;
    try {
      await accounts.transfer({
        from_account_id: Number(fromId),
        to_account_id: Number(toId),
        amount: transferAmount || 0,
        date: new Date().toISOString().slice(0, 10),
        description: transferDescription || "Transfer"
      });
      showTransfer = false;
    } catch {
      // error is surfaced via accounts.error below
    }
  }
</script>

<svelte:head><title>{m.accounts_page_title()}</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-ink">{m.accounts_heading()}</h1>
    <p class="text-sm text-ink-muted">
      {counted.length === 1
        ? m.accounts_summary_one({ total: formatCurrency(total) })
        : m.accounts_summary({ total: formatCurrency(total), count: counted.length })}{accounts.items.length >
      counted.length
        ? ` · ${m.accounts_not_counted({ count: accounts.items.length - counted.length })}`
        : ""}
    </p>
  </div>
  <div class="flex gap-2">
    <Button variant="secondary" disabled={accounts.items.length < 2} onclick={openTransfer}>{m.quick_transfer()}</Button>
    <Button onclick={() => (showForm = true)}><Plus size={16} aria-hidden="true" />{m.accounts_new()}</Button>
  </div>
</div>

{#if accounts.error}
  <p class="mb-4 rounded-xl bg-expense/10 p-2 text-sm text-expense">{accounts.error}</p>
{/if}

{#if accounts.items.length}
  <div class="divide-y divide-edge-subtle overflow-hidden rounded-2xl border border-edge bg-surface shadow-xs">
    {#each accounts.items as account (account.id)}
      <AccountCard {account} onremove={(id) => accounts.remove(id)} />
    {/each}
  </div>
{:else}
  <p class="rounded-2xl border border-dashed border-edge p-10 text-center text-ink-muted">
    {m.accounts_empty()}
  </p>
{/if}

<Modal open={showForm} title={m.accounts_new()} onclose={() => (showForm = false)}>
  <form class="flex flex-col gap-4" onsubmit={submit}>
    <Input label={m.field_name()} bind:value={name} placeholder={m.placeholder_account_name()} required />
    <Select
      label={m.field_type()}
      bind:value={accountType}
      options={[
        { value: "checking", label: m.account_type_checking() },
        { value: "savings", label: m.account_type_savings() },
        { value: "cash", label: m.account_type_cash() },
        { value: "other", label: m.account_type_other() }
      ]}
    />
    <Input label={m.field_initial_balance()} type="number" step="0.01" bind:value={initialBalance} placeholder="0.00" />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" onclick={() => (showForm = false)}>{m.action_cancel()}</Button>
      <Button type="submit" loading={accounts.saving}>{m.accounts_create_submit()}</Button>
    </div>
  </form>
</Modal>

<Modal open={showTransfer} title={m.modal_new_transfer()} onclose={() => (showTransfer = false)}>
  <form class="flex flex-col gap-4" onsubmit={submitTransfer}>
    <Select label={m.field_from()} bind:value={fromId} options={accountOptions} />
    <Select label={m.field_to()} bind:value={toId} options={accountOptions} />
    <Input label={m.field_amount()} type="number" step="0.01" bind:value={transferAmount} placeholder="0.00" required />
    <Input label={m.field_description()} bind:value={transferDescription} placeholder={m.placeholder_transfer_description()} />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" onclick={() => (showTransfer = false)}>{m.action_cancel()}</Button>
      <Button type="submit" loading={accounts.saving} disabled={fromId === toId}>{m.quick_transfer()}</Button>
    </div>
  </form>
</Modal>
