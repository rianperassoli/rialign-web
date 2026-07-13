<script lang="ts">
  import Card from "$components/ui/Card.svelte";
  import { formatCurrency, formatMonth, parseMoney } from "$utils/formatting";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const monthly = $derived(data.report.monthly);
  const categories = $derived(data.report.by_category);

  /* ---- Monthly income × expense columns (SVG) ---- */
  const CHART_H = 220;
  const BAR_W = 22;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 28;

  // Fill the card: the measured container width IS the viewBox width, so the
  // SVG renders 1:1 and the month bands stretch instead of letterboxing.
  let containerW = $state(720);
  const slotW = $derived(Math.max(56, containerW / monthly.length));
  const chartW = $derived(monthly.length * slotW);

  // Round the scale top up to a clean number (1/2/5 × 10^k).
  function niceCeil(value: number): number {
    if (value <= 0) return 100;
    const pow = 10 ** Math.floor(Math.log10(value));
    for (const step of [1, 2, 5, 10]) {
      if (value <= step * pow) return step * pow;
    }
    return 10 * pow;
  }

  const maxValue = $derived(
    niceCeil(Math.max(...monthly.map((m) => Math.max(parseMoney(m.income), parseMoney(m.expense)))))
  );
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  function barHeight(value: string): number {
    return (parseMoney(value) / maxValue) * plotH;
  }

  /** Column path: 4px rounded data-end (top), square at the baseline. */
  function columnPath(x: number, height: number, width = BAR_W): string {
    if (height <= 0) return "";
    const r = Math.min(4, height, width / 2);
    const top = PAD_TOP + plotH - height;
    const bottom = PAD_TOP + plotH;
    return [
      `M ${x} ${bottom}`,
      `L ${x} ${top + r}`,
      `Q ${x} ${top} ${x + r} ${top}`,
      `L ${x + width - r} ${top}`,
      `Q ${x + width} ${top} ${x + width} ${top + r}`,
      `L ${x + width} ${bottom}`,
      "Z"
    ].join(" ");
  }

  const gridLines = [0.25, 0.5, 0.75, 1];
  let hovered = $state<number | null>(null);
  const hoveredMonth = $derived(hovered === null ? null : (monthly[hovered] ?? null));

  function shortMonth(ym: string): string {
    return (formatMonth(ym).split(" ")[0] ?? "").slice(0, 3);
  }

  function compact(value: number): string {
    return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }

  /* ---- Category breakdown ---- */
  const categoryTotal = $derived(categories.reduce((sum, c) => sum + parseMoney(c.total), 0));
  const maxCategory = $derived(Math.max(1, ...categories.map((c) => parseMoney(c.total))));
</script>

<svelte:head><title>Insights · Rialign</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-ink">Insights</h1>
    <p class="text-sm text-ink-muted">
      {formatMonth(data.report.period.from)} – {formatMonth(data.report.period.to)}
    </p>
  </div>
  <div class="flex gap-1 rounded-xl border border-edge bg-surface p-1">
    {#each [3, 6, 12] as window (window)}
      <a
        href="?months={window}"
        data-sveltekit-noscroll
        class="rounded-md px-3 py-1.5 text-sm font-medium {data.months === window
          ? 'bg-brand-soft text-brand-soft-ink'
          : 'text-ink-secondary hover:bg-hover'}"
        aria-current={data.months === window ? "true" : undefined}
      >
        {window}m
      </a>
    {/each}
  </div>
</div>

<div class="flex flex-col gap-6">
  <Card title="Income × expenses by month">
    <div class="mb-3 flex items-center gap-4 text-xs text-ink-secondary">
      <span class="inline-flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-income" aria-hidden="true"></span> Income
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="size-2.5 rounded-full bg-expense" aria-hidden="true"></span> Expenses
      </span>
    </div>

    <div class="relative overflow-x-auto" bind:clientWidth={containerW}>
      <svg viewBox="0 0 {chartW} {CHART_H}" width={chartW} height={CHART_H} role="img"
        aria-label="Monthly income and expenses">
        <!-- recessive hairline grid + clean tick values -->
        {#each gridLines as frac (frac)}
          {@const y = PAD_TOP + plotH * (1 - frac)}
          <line x1="0" x2={chartW} y1={y} y2={y} stroke="var(--app-edge-subtle)" stroke-width="1" />
          <text x="4" y={y - 3} class="fill-ink-muted" font-size="10">{compact(maxValue * frac)}</text>
        {/each}
        <line x1="0" x2={chartW} y1={PAD_TOP + plotH} y2={PAD_TOP + plotH} stroke="var(--app-edge)" stroke-width="1" />

        {#each monthly as m, i (m.month)}
          {@const cx = i * slotW + slotW / 2}
          <!-- 2px surface gap between the paired columns -->
          <path d={columnPath(cx - BAR_W - 1, barHeight(m.income))} class="fill-income" />
          <path d={columnPath(cx + 1, barHeight(m.expense))} class="fill-expense" />
          <text x={cx} y={CHART_H - 8} text-anchor="middle" font-size="11"
            class={hovered === i ? "fill-ink font-medium" : "fill-ink-muted"}>
            {shortMonth(m.month)}
          </text>
          <!-- hover hit target: the whole month band -->
          <rect
            x={i * slotW} y="0" width={slotW} height={CHART_H} fill="transparent"
            onmouseenter={() => (hovered = i)}
            onmouseleave={() => (hovered = null)}
            role="presentation"
          />
        {/each}
      </svg>

      {#if hovered !== null && hoveredMonth}
        {@const m = hoveredMonth}
        <div
          class="pointer-events-none absolute top-0 z-10 w-44 rounded-xl border border-edge bg-surface p-3 text-xs shadow-lg"
          style="left: clamp(0px, calc({((hovered + 0.5) / monthly.length) * 100}% - 88px), calc(100% - 176px))"
        >
          <p class="mb-1 font-semibold text-ink">{formatMonth(m.month)}</p>
          <p class="flex justify-between text-ink-secondary">
            <span>Income</span><span class="font-medium">{formatCurrency(m.income)}</span>
          </p>
          <p class="flex justify-between text-ink-secondary">
            <span>Expenses</span><span class="font-medium">{formatCurrency(m.expense)}</span>
          </p>
          <p class="mt-1 flex justify-between border-t border-edge-subtle pt-1 text-ink">
            <span>Net</span><span class="font-semibold">{formatCurrency(m.net)}</span>
          </p>
        </div>
      {/if}
    </div>

    <!-- Screen-reader / no-hover fallback for the exact values -->
    <table class="sr-only">
      <caption>Monthly income and expenses</caption>
      <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead>
      <tbody>
        {#each monthly as m (m.month)}
          <tr>
            <td>{formatMonth(m.month)}</td>
            <td>{formatCurrency(m.income)}</td>
            <td>{formatCurrency(m.expense)}</td>
            <td>{formatCurrency(m.net)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Card>

  <Card title="Expenses by category">
    {#if categories.length === 0}
      <p class="py-8 text-center text-sm text-ink-muted">No paid expenses in this period yet.</p>
    {:else}
      <ul class="flex flex-col gap-3">
        {#each categories as cat (cat.category_id)}
          {@const value = parseMoney(cat.total)}
          <li>
            <div class="mb-1 flex items-baseline justify-between text-sm">
              <span class="font-medium text-ink-secondary">{cat.name}</span>
              <span class="text-ink-secondary">
                {formatCurrency(cat.total)}
                <span class="ml-1 text-xs text-ink-muted">
                  {categoryTotal ? Math.round((value / categoryTotal) * 100) : 0}%
                </span>
              </span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-surface-subtle">
              <div
                class="h-full rounded-full"
                style="width: {(value / maxCategory) * 100}%; background-color: {cat.color ?? '#94a3b8'}"
              ></div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </Card>
</div>
