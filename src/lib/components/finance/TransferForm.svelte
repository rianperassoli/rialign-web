<script lang="ts">
  import type { Account, TransferInput } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import Select from "$components/ui/Select.svelte";
  import { toDateInput } from "$utils/formatting";
  import { m } from "$lib/paraglide/messages";

  interface Props {
    accounts: Account[];
    /** Returns a rejected promise (ApiError) to surface server-side errors. */
    onsubmit: (input: TransferInput) => Promise<unknown>;
    oncancel?: () => void;
  }
  let { accounts, onsubmit, oncancel }: Props = $props();

  let fromAccountId = $state<number | "">("");
  let toAccountId = $state<number | "">("");
  let description = $state(m.transfer_default_description());
  let amount = $state("");
  let date = $state(toDateInput());

  let submitting = $state(false);
  let errors = $state<string[]>([]);

  const accountOptions = $derived(accounts.map((a) => ({ value: a.id, label: a.name })));

  function validate(): string[] {
    const e: string[] = [];
    if (fromAccountId === "") e.push(m.transfer_err_from());
    if (toAccountId === "") e.push(m.transfer_err_to());
    if (fromAccountId !== "" && fromAccountId === toAccountId) {
      e.push(m.transfer_err_same());
    }
    if (!amount || Number(amount) <= 0) e.push(m.form_err_amount());
    return e;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errors = validate();
    if (errors.length) return;

    submitting = true;
    try {
      await onsubmit({
        from_account_id: Number(fromAccountId),
        to_account_id: Number(toAccountId),
        amount,
        date,
        description: description.trim() || m.transfer_default_description()
      });
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

  <Select
    label={m.transfer_from_account()}
    bind:value={fromAccountId}
    options={accountOptions}
    placeholder={m.placeholder_select_account()}
  />
  <Select
    label={m.transfer_to_account()}
    bind:value={toAccountId}
    options={accountOptions}
    placeholder={m.placeholder_select_account()}
  />

  <Input label={m.field_description()} bind:value={description} placeholder={m.transfer_default_description()} />

  <div class="grid grid-cols-2 gap-3">
    <Input label={m.field_amount()} type="number" step="0.01" min="0" bind:value={amount} placeholder="0.00" required />
    <Input label={m.field_date()} type="date" bind:value={date} required />
  </div>

  <div class="flex justify-end gap-2 pt-2">
    {#if oncancel}
      <Button type="button" variant="secondary" onclick={oncancel}>{m.action_cancel()}</Button>
    {/if}
    <Button type="submit" variant="neutral" loading={submitting}>{m.transfer_submit()}</Button>
  </div>
</form>
