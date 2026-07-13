<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
  let submitting = $state(false);
</script>

<svelte:head><title>Create account · Rialign</title></svelte:head>

<h2 class="mb-4 text-lg font-semibold text-ink">Create your account</h2>

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
  <Input label="Name" name="name" value={form?.name ?? ""} required autocomplete="name" />
  <Input label="Email" name="email" type="email" value={form?.email ?? ""} required autocomplete="email" />
  <Input label="Password" name="password" type="password" required autocomplete="new-password" minlength={8} />
  <Input label="Confirm password" name="password_confirmation" type="password" required autocomplete="new-password" />
  <Button type="submit" loading={submitting}>Create account</Button>
</form>

<p class="mt-4 text-center text-sm text-ink-muted">
  Already have an account? <a href="/login" class="font-medium text-brand-600 hover:underline">Log in</a>
</p>
