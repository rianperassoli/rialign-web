<script lang="ts">
  import Navbar from "$components/layout/Navbar.svelte";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen">
  <Navbar />
  <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    {@render children()}
  </main>
</div>
