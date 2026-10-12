<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import type { ActionData } from "./$types";
  import { m } from "$lib/paraglide/messages";

  let { form }: { form: ActionData } = $props();
  let submitting = $state(false);
</script>

<svelte:head><title>{m.login_page_title()}</title></svelte:head>

<h2 class="mb-4 text-lg font-semibold text-ink">{m.login_heading()}</h2>

{#if form?.error}
  <p class="mb-3 rounded-xl bg-expense/10 p-2 text-sm text-expense">{form.error}</p>
{/if}

<form
  method="POST"
  class="flex flex-col gap-4"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update();
      submitting = false;
    };
  }}
>
  <Input label={m.field_email()} name="email" type="email" value={form?.email ?? ""} required autocomplete="email" />
  <Input label={m.field_password()} name="password" type="password" required autocomplete="current-password" />
  <Button type="submit" loading={submitting}>{m.login_submit()}</Button>
</form>

<p class="mt-4 text-center text-sm text-ink-muted">
  {m.login_no_account()}
  <a href="/register" class="font-medium text-brand-600 hover:underline">{m.login_create_one()}</a>
</p>
