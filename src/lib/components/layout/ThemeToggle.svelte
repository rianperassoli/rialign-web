<script lang="ts">
  import Monitor from "@lucide/svelte/icons/monitor";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import { browser } from "$app/environment";
  import { m } from "$lib/paraglide/messages";

  type Theme = "system" | "light" | "dark";

  function stored(): Theme {
    if (!browser) return "system";
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : "system";
  }

  let theme = $state<Theme>(stored());

  function select(next: Theme) {
    theme = next;
    if (next === "system") {
      localStorage.removeItem("theme");
      delete document.documentElement.dataset.theme;
    } else {
      localStorage.setItem("theme", next);
      document.documentElement.dataset.theme = next;
    }
  }
</script>

<div class="flex items-center gap-0.5 rounded-xl bg-surface-subtle p-0.5" role="group" aria-label={m.theme_group()}>
  <button
    onclick={() => select("light")}
    class="cursor-pointer rounded-[10px] p-1.5 transition duration-150 {theme === 'light'
      ? 'bg-surface text-ink shadow-xs'
      : 'text-ink-muted hover:text-ink-secondary'}"
    title={m.theme_light()}
    aria-label={m.theme_light()}
    aria-pressed={theme === "light"}
  >
    <Sun size={15} aria-hidden="true" />
  </button>
  <button
    onclick={() => select("dark")}
    class="cursor-pointer rounded-[10px] p-1.5 transition duration-150 {theme === 'dark'
      ? 'bg-surface text-ink shadow-xs'
      : 'text-ink-muted hover:text-ink-secondary'}"
    title={m.theme_dark()}
    aria-label={m.theme_dark()}
    aria-pressed={theme === "dark"}
  >
    <Moon size={15} aria-hidden="true" />
  </button>
  <button
    onclick={() => select("system")}
    class="cursor-pointer rounded-[10px] p-1.5 transition duration-150 {theme === 'system'
      ? 'bg-surface text-ink shadow-xs'
      : 'text-ink-muted hover:text-ink-secondary'}"
    title={m.theme_system()}
    aria-label={m.theme_system()}
    aria-pressed={theme === "system"}
  >
    <Monitor size={15} aria-hidden="true" />
  </button>
</div>
