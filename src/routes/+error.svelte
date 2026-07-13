<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
  <p class="text-5xl font-bold text-brand-700">{page.status}</p>
  <h1 class="text-xl font-semibold text-ink">
    {page.error?.message ?? "Something went wrong"}
  </h1>
  <a href="/dashboard" class="mt-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
    Back to dashboard
  </a>
</div>
