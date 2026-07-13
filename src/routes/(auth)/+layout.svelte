<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-subtle px-4">
  <div class="w-full max-w-sm">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-brand-700">Rianganizze</h1>
      <p class="text-sm text-ink-muted">Personal finance, organized.</p>
    </div>
    <div class="rounded-2xl border border-edge bg-surface p-6 shadow-xs">
      {@render children()}
    </div>
  </div>
</div>
