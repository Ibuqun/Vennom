<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import VirtualList from '$lib/components/VirtualList.svelte';
  import CloseIcon from '$lib/icons/CloseIcon.svelte';
  import SearchIcon from '$lib/icons/SearchIcon.svelte';
  import CopyIcon from '$lib/icons/CopyIcon.svelte';
  import DownloadIcon from '$lib/icons/DownloadIcon.svelte';
  import { copyToClipboard, downloadCsv, downloadText } from '$lib/utils/exporters';

  let {
    open,
    title,
    items,
    closeAction,
    toastAction
  }: {
    open: boolean;
    title: string;
    items: string[];
    closeAction: () => void;
    toastAction: (m: string, t?: 'info' | 'success' | 'error') => void;
  } = $props();

  let query = $state('');
  let modalEl = $state<HTMLDivElement | null>(null);
  let filterEl = $state<HTMLInputElement | null>(null);
  const filtered = $derived(items.filter((item) => item.toLocaleLowerCase().includes(query.toLocaleLowerCase())));

  $effect(() => {
    if (!open) return;
    query = '';
    queueMicrotask(() => filterEl?.focus());
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAction();
      if (e.key !== 'Tab' || !modalEl) return;
      const focusable = Array.from(
        modalEl.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  });

  async function copy(json = false) {
    await copyToClipboard(filtered, json);
    toastAction('Copied to clipboard', 'success');
  }
</script>

{#if open}
  <button type="button" class="backdrop" aria-label="Close results modal" onclick={closeAction} transition:fade={{ duration: 120 }}></button>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    bind:this={modalEl}
    transition:scale={{ duration: 150 }}
  >
    <header>
      <h2>{title}</h2>
      <button type="button" onclick={closeAction} aria-label="Close modal"><CloseIcon size={18} /></button>
    </header>

    <div class="controls">
      <label>
        <SearchIcon size={14} />
        <input bind:this={filterEl} bind:value={query} placeholder="Filter results" />
      </label>
      <div class="actions">
        <button type="button" onclick={() => copy(false)}><CopyIcon size={14} /> Copy List</button>
        <button type="button" onclick={() => copy(true)}><CopyIcon size={14} /> Copy JSON</button>
        <button type="button" onclick={() => downloadText('vennom-results.txt', filtered)}><DownloadIcon size={14} /> TXT</button>
        <button type="button" onclick={() => downloadCsv('vennom-results.csv', filtered)}><DownloadIcon size={14} /> CSV</button>
      </div>
    </div>

    <p class="summary">{filtered.length} items • First 10: {filtered.slice(0, 10).join(', ') || 'none'}</p>
    <VirtualList items={filtered} height={360} />
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: var(--overlay);
    z-index: 40;
    border: 0;
    padding: 0;
    width: 100%;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(860px, 94vw);
    max-height: 92vh;
    overflow: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 0.8rem;
    padding: 1rem;
    z-index: 41;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    margin: 0;
    font-size: 1.1rem;
  }
  .controls {
    display: grid;
    gap: 0.6rem;
    margin: 0.8rem 0;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.45rem 0.6rem;
  }
  input {
    width: 100%;
    background: transparent;
    border: 0;
    color: inherit;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .actions button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .summary {
    font-family: var(--font-mono);
    color: var(--text-dim);
    font-size: 0.82rem;
  }
</style>
