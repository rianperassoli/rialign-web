<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    /** Colour of the "on" track. Defaults to the brand green. */
    variant?: "brand" | "income" | "expense";
    /** Fires only on user interaction, so callers can tell a manual choice
        apart from a value the form defaulted for them. */
    onchange?: (checked: boolean) => void;
  }
  let { checked = $bindable(), label, variant = "brand", onchange }: Props = $props();

  const onTrack = {
    brand: "bg-brand-600",
    income: "bg-income",
    expense: "bg-expense"
  } as const;
</script>

<label class="flex cursor-pointer items-center gap-2.5 text-sm text-ink-secondary">
  <span
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition duration-150 {checked
      ? onTrack[variant]
      : 'bg-edge'}"
  >
    <input type="checkbox" bind:checked onchange={() => onchange?.(checked)} class="peer sr-only" />
    <span
      class="pointer-events-none ml-0.5 h-5 w-5 rounded-full bg-white shadow transition duration-150 {checked
        ? 'translate-x-5'
        : 'translate-x-0'}"
    ></span>
  </span>
  {label}
</label>
