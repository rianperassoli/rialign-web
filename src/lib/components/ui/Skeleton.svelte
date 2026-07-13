<script lang="ts">
  interface Props {
    class?: string;
    rows?: number;
  }
  let { class: klass = "h-4 w-full", rows = 1 }: Props = $props();
</script>

{#each Array(rows) as _, i (i)}
  <div class="animate-pulse rounded bg-surface-subtle {klass}" aria-hidden="true"></div>
{/each}
