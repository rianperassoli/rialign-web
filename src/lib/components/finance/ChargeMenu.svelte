<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Pencil from "@lucide/svelte/icons/pencil";
  import { m } from "$lib/paraglide/messages";

  // Per-charge actions on an invoice: edit it, or push it to the invoice
  // before/after (Organizze's "enviar para a fatura anterior/próxima"). A paid
  // invoice cannot take a charge, so that direction is shown disabled.
  let {
    onedit,
    onmove,
    previousPaid = false,
    nextPaid = false,
    disabled = false
  }: {
    onedit: () => void;
    onmove: (delta: -1 | 1) => void;
    previousPaid?: boolean;
    nextPaid?: boolean;
    disabled?: boolean;
  } = $props();

  let open = $state(false);
  let menu = $state<HTMLDivElement>();

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") open = false;
  }

  function onpointerdown(e: PointerEvent) {
    if (open && menu && !menu.contains(e.target as Node)) open = false;
  }

  function pick(action: () => void) {
    open = false;
    action();
  }

  const itemClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink-secondary transition duration-150 hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";
</script>

<svelte:window {onkeydown} {onpointerdown} />

<div class="relative shrink-0" bind:this={menu}>
  <button
    class="cursor-pointer rounded-xl p-1.5 text-ink-muted transition duration-150 hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label={m.invoice_charge_actions()}
    title={m.invoice_charge_actions()}
    {disabled}
    onclick={() => (open = !open)}
  >
    <ChevronDown size={16} aria-hidden="true" />
  </button>

  {#if open}
    <div class="absolute right-0 z-50 mt-1 w-60 rounded-2xl border border-edge bg-surface p-1.5 shadow-lg" role="menu">
      <button role="menuitem" class={itemClass} onclick={() => pick(onedit)}>
        <Pencil size={15} aria-hidden="true" />
        {m.invoice_edit_charge()}
      </button>
      <div class="my-1.5 border-t border-edge"></div>
      <button role="menuitem" class={itemClass} disabled={previousPaid} onclick={() => pick(() => onmove(-1))}>
        <ArrowLeft size={15} class="shrink-0" aria-hidden="true" />
        <span>
          {m.invoice_move_previous()}
          {#if previousPaid}<span class="block text-xs text-ink-muted">{m.invoice_move_paid()}</span>{/if}
        </span>
      </button>
      <button role="menuitem" class={itemClass} disabled={nextPaid} onclick={() => pick(() => onmove(1))}>
        <ArrowRight size={15} class="shrink-0" aria-hidden="true" />
        <span>
          {m.invoice_move_next()}
          {#if nextPaid}<span class="block text-xs text-ink-muted">{m.invoice_move_paid()}</span>{/if}
        </span>
      </button>
    </div>
  {/if}
</div>
