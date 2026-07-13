<script lang="ts">
  import Monitor from "@lucide/svelte/icons/monitor";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import { browser } from "$app/environment";

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

<div class="flex items-center gap-0.5 rounded-xl bg-surface-subtle p-0.5" role="group" aria-label="Theme">
  <button
    onclick={() => select("light")}
    class="rounded-[10px] p-1.5 transition duration-150 {theme === 'light'
      ? 'bg-surface text-ink shadow-xs'
      : 'text-ink-muted hover:text-ink-secondary'}"
    title="Light theme"
    aria-label="Light theme"
    aria-pressed={theme === "light"}
  >
    <Sun size={15} aria-hidden="true" />
  </button>
  <button
    onclick={() => select("dark")}
    class="rounded-[10px] p-1.5 transition duration-150 {theme === 'dark'
      ? 'bg-surface text-ink shadow-xs'
      : 'text-ink-muted hover:text-ink-secondary'}"
    title="Dark theme"
    aria-label="Dark theme"
    aria-pressed={theme === "dark"}
  >
    <Moon size={15} aria-hidden="true" />
  </button>
  <button
    onclick={() => select("system")}
    class="rounded-[10px] p-1.5 transition duration-150 {theme === 'system'
      ? 'bg-surface text-ink shadow-xs'
      : 'text-ink-muted hover:text-ink-secondary'}"
    title="System theme"
    aria-label="System theme"
    aria-pressed={theme === "system"}
  >
    <Monitor size={15} aria-hidden="true" />
  </button>
</div>
