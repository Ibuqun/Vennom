<script lang="ts">
  import UploadIcon from '$lib/icons/UploadIcon.svelte';
  import ClearIcon from '$lib/icons/ClearIcon.svelte';
  import SwapIcon from '$lib/icons/SwapIcon.svelte';
  import ArrowRightIcon from '$lib/icons/ArrowRightIcon.svelte';
  import PlusIcon from '$lib/icons/CheckIcon.svelte';
  import MinusIcon from '$lib/icons/CloseIcon.svelte';
  import type { DelimiterMode } from '$lib/utils/parsers';
  import { detectLongLines, estimateItemCount, parseFileContent, parseUploadedFile } from '$lib/utils/parsers';

  let {
    lists = [],
    delimiter = 'auto',
    setListAt,
    setDelimiter,
    compareAction,
    swapAction,
    clearAction,
    sampleAction,
    addListAction,
    removeListAction,
    isRunning = false,
    toastAction
  }: {
    lists: string[];
    delimiter: DelimiterMode;
    setListAt: (index: number, value: string) => void;
    setDelimiter: (delimiter: DelimiterMode) => void;
    compareAction: () => void;
    swapAction: () => void;
    clearAction: () => void;
    sampleAction: () => void;
    addListAction: () => void;
    removeListAction: () => void;
    isRunning?: boolean;
    toastAction: (message: string, type?: 'info' | 'success' | 'error') => void;
  } = $props();

  let dragTarget = $state<number | null>(null);

  const listStats = $derived(
    lists.map((list) => ({
      chars: list.length,
      items: estimateItemCount(list, delimiter),
      longLines: detectLongLines(list)
    }))
  );

  async function handleDrop(event: DragEvent, index: number) {
    event.preventDefault();
    dragTarget = null;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const parsed = parseFileContent(await parseUploadedFile(file), file.name.toLowerCase());
    setListAt(index, parsed);
    toastAction(`Loaded ${file.name}`, 'success');
  }

  function keyCompare(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      compareAction();
    }
  }

</script>

<section class="input-shell" role="group">
  <div class="input-grid">
    {#each lists as list, index (index)}
      <article
        class:drag={dragTarget === index}
        ondragover={(e) => {
          e.preventDefault();
          dragTarget = index;
        }}
        ondragleave={() => (dragTarget = null)}
        ondrop={(e) => handleDrop(e, index)}
      >
        <header><h2>List {String.fromCharCode(65 + index)}</h2><UploadIcon size={16} /></header>
        <textarea
          data-testid={index === 0 ? 'list-a' : index === 1 ? 'list-b' : `list-${index + 1}`}
          value={list}
          oninput={(e) => setListAt(index, (e.currentTarget as HTMLTextAreaElement).value)}
          onkeydown={keyCompare}
          placeholder={`Paste List ${String.fromCharCode(65 + index)}`}
        ></textarea>
        <footer>
          <span>{listStats[index].chars} chars</span>
          <span>{listStats[index].items} items</span>
          {#if listStats[index].longLines > 0}<span class="warning">{listStats[index].longLines} long lines &gt;10k</span>{/if}
        </footer>
      </article>
    {/each}
  </div>

  <div class="toolbar">
    <label>
      Delimiter
      <select value={delimiter} onchange={(e) => setDelimiter((e.currentTarget as HTMLSelectElement).value as DelimiterMode)}>
        <option value="auto">Auto</option>
        <option value="newline">Newline</option>
        <option value="comma">Comma</option>
        <option value="semicolon">Semicolon</option>
        <option value="tab">Tab</option>
      </select>
    </label>

    <div class="buttons">
      <button
        type="button"
        data-testid="compare-btn"
        onclick={compareAction}
        disabled={isRunning}
        class="compare"
      ><ArrowRightIcon size={15} /> {isRunning ? 'Comparing...' : 'Compare'}</button>
      <button type="button" onclick={swapAction}><SwapIcon size={15} /> Swap Lists</button>
      <button type="button" onclick={clearAction}><ClearIcon size={15} /> Clear All</button>
      <button type="button" data-testid="sample-btn" onclick={sampleAction}>Sample Data</button>
      <button type="button" onclick={addListAction}><PlusIcon size={15} /> Add List</button>
      <button type="button" onclick={removeListAction} disabled={lists.length <= 2}><MinusIcon size={15} /> Remove List</button>
    </div>
  </div>
</section>

<style>
  .input-shell {
    display: grid;
    gap: 0.7rem;
  }
  .input-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.7rem;
  }
  article {
    border: 1px solid var(--border);
    border-radius: 0.65rem;
    background: var(--surface-2);
    padding: 0.7rem;
    transition: box-shadow 0.2s ease;
  }
  article.drag {
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.7);
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.45rem;
  }
  h2 {
    margin: 0;
    font-family: var(--font-head);
    font-size: 0.95rem;
  }
  textarea {
    width: 100%;
    height: 220px;
    resize: vertical;
    background: rgba(6, 6, 11, 0.9);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 0.45rem;
    padding: 0.65rem;
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }
  footer {
    margin-top: 0.45rem;
    display: flex;
    gap: 0.7rem;
    flex-wrap: wrap;
    font-size: 0.76rem;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }
  .warning {
    color: #f59e0b;
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .compare {
    background: linear-gradient(130deg, #0ea5a5, #0f766e);
    color: #fefefe;
  }

  @media (max-width: 860px) {
    .input-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
