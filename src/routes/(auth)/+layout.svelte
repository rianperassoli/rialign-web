<script lang="ts">
  import type { Snippet } from "svelte";
  import Logo from "$components/brand/Logo.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-subtle px-4">
  <div class="w-full max-w-sm">
    <div class="mb-8 flex justify-center">
      <Logo size={52} tagline />
    </div>
    <div class="rounded-2xl border border-edge bg-surface p-6 shadow-xs">
      {@render children()}
    </div>
  </div>
</div>
