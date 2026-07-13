<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
  let submitting = $state(false);
</script>

<svelte:head><title>Log in · Rianganizze</title></svelte:head>

<h2 class="mb-4 text-lg font-semibold text-ink">Welcome back</h2>

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
  <Input label="Email" name="email" type="email" value={form?.email ?? ""} required autocomplete="email" />
  <Input label="Password" name="password" type="password" required autocomplete="current-password" />
  <Button type="submit" loading={submitting}>Log in</Button>
</form>

<p class="mt-4 text-center text-sm text-ink-muted">
  No account? <a href="/register" class="font-medium text-brand-600 hover:underline">Create one</a>
</p>
