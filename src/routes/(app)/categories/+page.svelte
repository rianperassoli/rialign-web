<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import type { Category, TransactionKind } from "$api/types";
  import Button from "$components/ui/Button.svelte";
  import Input from "$components/ui/Input.svelte";
  import Modal from "$components/ui/Modal.svelte";
  import Select from "$components/ui/Select.svelte";
  import { useCategories } from "$composables/useCategories.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const categories = useCategories(data.categories);

  let showForm = $state(false);
  let editing = $state<Category | null>(null);
  let name = $state("");
  let kind = $state<TransactionKind>("expense");
  let color = $state("#64748b");

  function openCreate() {
    editing = null;
    name = "";
    kind = "expense";
    color = "#64748b";
    showForm = true;
  }

  function openEdit(category: Category) {
    editing = category;
    name = category.name;
    kind = category.kind;
    color = category.color ?? "#64748b";
    showForm = true;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    try {
      if (editing) {
        await categories.update(editing.id, { name, kind, color });
      } else {
        await categories.create({ name, kind, color });
      }
      showForm = false;
    } catch {
      // error surfaced via categories.error
    }
  }
</script>

<svelte:head><title>Categories · Rianganizze</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-ink">Categories</h1>
    <p class="text-sm text-ink-muted">{categories.items.length} categories</p>
  </div>
  <Button onclick={openCreate}><Plus size={16} aria-hidden="true" />New category</Button>
</div>

{#if categories.error}
  <p class="mb-4 rounded-xl bg-expense/10 p-2 text-sm text-expense">{categories.error}</p>
{/if}

<div class="grid gap-6 md:grid-cols-2">
  {#each [{ label: "Income", list: categories.income }, { label: "Expense", list: categories.expense }] as group (group.label)}
    <section>
      <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">{group.label}</h2>
      <div class="flex flex-col gap-2">
        {#each group.list as category (category.id)}
          <div class="flex items-center justify-between rounded-2xl border border-edge bg-surface p-4 shadow-xs">
            <div class="flex items-center gap-3">
              <span class="h-3 w-3 rounded-full" style="background:{category.color ?? '#cbd5e1'}"></span>
              <span class="font-medium text-ink">{category.name}</span>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" onclick={() => openEdit(category)}>Edit</Button>
              <Button variant="ghost" size="sm" onclick={() => categories.remove(category.id)}>Archive</Button>
            </div>
          </div>
        {:else}
          <p class="rounded-2xl border border-dashed border-edge p-6 text-center text-sm text-ink-muted">
            No {group.label.toLowerCase()} categories yet.
          </p>
        {/each}
      </div>
    </section>
  {/each}
</div>

<Modal open={showForm} title={editing ? "Edit category" : "New category"} onclose={() => (showForm = false)}>
  <form class="flex flex-col gap-4" onsubmit={submit}>
    <Input label="Name" bind:value={name} placeholder="e.g. Groceries" required />
    <Select
      label="Kind"
      bind:value={kind}
      options={[
        { value: "expense", label: "Expense" },
        { value: "income", label: "Income" }
      ]}
    />
    <Input label="Color" type="color" bind:value={color} />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" onclick={() => (showForm = false)}>Cancel</Button>
      <Button type="submit" loading={categories.saving}>{editing ? "Save" : "Create"}</Button>
    </div>
  </form>
</Modal>
