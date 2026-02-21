<script lang="ts">
  import { onMount } from 'svelte';
  import ListInput from '$lib/components/ListInput.svelte';
  import VennDiagram from '$lib/components/VennDiagram.svelte';
  import StatsPanel from '$lib/components/StatsPanel.svelte';
  import ResultsModal from '$lib/components/ResultsModal.svelte';
  import Toast, { type ToastItem } from '$lib/components/Toast.svelte';
  import LockIcon from '$lib/icons/LockIcon.svelte';
  import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
  import MoonIcon from '$lib/icons/MoonIcon.svelte';
  import SunIcon from '$lib/icons/SunIcon.svelte';
  import DownloadIcon from '$lib/icons/DownloadIcon.svelte';
  import VennDiagramIcon from '$lib/icons/VennDiagramIcon.svelte';
  import ShareIcon from '$lib/icons/ArrowRightIcon.svelte';
  import { nextId } from '$lib/utils/id-generator';
  import { compareWithWorker, cleanupWorker } from '$lib/workers/worker-client';
  import { applyRegexFilter, splitItems, type DelimiterMode } from '$lib/utils/parsers';
  import { buildShareUrl, decodeSharePayload, downloadJson, exportNodeToPng } from '$lib/utils/exporters';
  import {
    compareManyLists,
    type ComparisonOptions,
    type ComparisonResult,
    type MultiComparisonResult,
    type WorkerProgress
  } from '$lib/utils/sets';
  import { preferences } from '$lib/stores/preferences.svelte';

  let lists = $state<string[]>(['', '']);
  let delimiter = $state<DelimiterMode>('auto');
  let result = $state<ComparisonResult | null>(null);
  let multiResult = $state<MultiComparisonResult | null>(null);
  let running = $state(false);
  let progress = $state<WorkerProgress>({ phase: 'idle', value: 0 });

  let options = $state<ComparisonOptions>({
    caseSensitive: false,
    delimiter: 'auto',
    treatAsMultiset: false,
    fuzzyMatch: false,
    fuzzyDistance: 1,
    ignoreCommonWords: false,
    regexFilter: '',
    sortMode: 'alphabetical'
  });

  let modal = $state({ open: false, title: '', items: [] as string[] });
  let toasts = $state<ToastItem[]>([]);

  let vennRef = $state<HTMLElement | null>(null);
  let inactivityTimeout: ReturnType<typeof setTimeout> | null = null;
  const sampleA = ['apple', 'banana', 'kiwi', 'dragonfruit', 'pear', 'orange', 'grape'].join('\n');
  const sampleB = ['banana', 'kiwi', 'orange', 'mango', 'papaya', 'grape', 'melon'].join('\n');

  function toast(message: string, type: ToastItem['type'] = 'info') {
    const id = nextId('toast');
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, 3200);
  }

  function dismissToast(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
  }

  function resetInactivity() {
    if (!preferences.privacyMode) return;
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      lists = lists.map(() => '');
      result = null;
      multiResult = null;
      toast('Privacy mode: data auto-cleared after inactivity', 'info');
    }, 5 * 60 * 1000);
  }

  async function runCompare() {
    if (!lists.some((v) => v.trim().length > 0)) {
      toast('Enter data in at least one list before comparing', 'error');
      return;
    }
    options.delimiter = delimiter;
    running = true;
    progress = { phase: 'processing', value: 0.05 };
    try {
      if (lists.length === 2) {
        result = await compareWithWorker(lists[0], lists[1], options, (p) => (progress = p));
        multiResult = null;
      } else {
        const parsed = lists.map((raw) => applyRegexFilter(splitItems(raw, delimiter), options.regexFilter));
        multiResult = compareManyLists(parsed, options);
        result = null;
        progress = { phase: 'done', value: 1 };
      }
      toast('Comparison complete', 'success');
    } catch {
      toast('Comparison failed', 'error');
    } finally {
      running = false;
    }
  }

  function selectRegion(region: 'onlyA' | 'intersection' | 'onlyB') {
    if (!result) return;
    const map = {
      onlyA: { title: 'Items only in A', items: result.onlyA },
      intersection: { title: 'Items in intersection', items: result.intersection },
      onlyB: { title: 'Items only in B', items: result.onlyB }
    };
    modal = { open: true, ...map[region] };
  }

  function clearAll() {
    lists = lists.map(() => '');
    result = null;
    multiResult = null;
  }

  function setListAt(index: number, value: string) {
    const next = [...lists];
    next[index] = value;
    lists = next;
  }

  function setDelimiterValue(value: DelimiterMode) {
    delimiter = value;
  }

  function swapLists() {
    if (lists.length < 2) return;
    const next = [...lists];
    const first = next[0];
    next[0] = next[1];
    next[1] = first;
    lists = next;
  }

  function addList() {
    if (lists.length >= 8) return;
    lists = [...lists, ''];
  }

  function removeList() {
    if (lists.length <= 2) return;
    lists = lists.slice(0, -1);
  }

  function loadSample() {
    const next = [...lists];
    next[0] = sampleA;
    next[1] = sampleB;
    for (let i = 2; i < next.length; i += 1) next[i] = '';
    lists = next;
  }

  async function exportPng() {
    if (!vennRef) return;
    await exportNodeToPng(vennRef, 'vennom-venn.png');
    toast('Exported Venn PNG', 'success');
  }

  function share() {
    if (lists.length !== 2) {
      toast('Share URL is available in two-list mode only', 'error');
      return;
    }
    const link = buildShareUrl(lists[0], lists[1]);
    if (link.length > 2000) {
      toast('Share URL is long; consider JSON export instead', 'error');
    }
    navigator.clipboard.writeText(link);
    toast('Share URL copied', 'success');
  }

  function parseShareFromUrl() {
    const d = new URL(window.location.href).searchParams.get('d');
    if (!d) return;
    const decoded = decodeSharePayload(d);
    if (decoded) {
      lists = [decoded.a, decoded.b];
      toast('Loaded shared data from URL', 'info');
    }
  }

  $effect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    preferences.save();
  });

  $effect(() => {
    resetInactivity();
  });

  onMount(() => {
    parseShareFromUrl();
    resetInactivity();
    const listener = () => resetInactivity();
    window.addEventListener('mousemove', listener);
    window.addEventListener('keydown', listener);
    window.addEventListener('beforeunload', () => {
      clearAll();
      cleanupWorker();
    });
    return () => {
      window.removeEventListener('mousemove', listener);
      window.removeEventListener('keydown', listener);
      cleanupWorker();
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
    };
  });
</script>

<main id="main" class="container page">
  <header class="top card">
    <div>
      <h1><VennDiagramIcon size={22} /> Vennom</h1>
      <p>Privacy-first list comparison with interactive Venn analysis.</p>
      <div class="privacy"><LockIcon size={14} /> 100% Private — No data leaves your browser</div>
    </div>
    <div class="prefs">
      <button
        type="button"
        class="theme-toggle"
        aria-label="Toggle light and dark mode"
        onclick={() => (preferences.theme = preferences.theme === 'dark' ? 'light' : 'dark')}
      >
        {#if preferences.theme === 'dark'}<MoonIcon size={14} />{:else}<SunIcon size={14} />{/if}
        <span>{preferences.theme === 'dark' ? 'Dark' : 'Light'} mode</span>
      </button>
      <label><input type="checkbox" bind:checked={preferences.privacyMode} /> Privacy Mode</label>
      <label><input type="checkbox" bind:checked={preferences.allowPersistence} /> Save prefs locally</label>
    </div>
  </header>

  <section class="card quick-status" aria-label="Comparison mode">
    <span class="pill">Lists: {lists.length}</span>
    <span class="pill">{lists.length === 2 ? '2-list Venn mode' : 'Multi-list analysis mode'}</span>
    <span class="pill">Shortcut: Ctrl/Cmd + Enter</span>
  </section>

  <section class="card">
    <ListInput
      {lists}
      {delimiter}
      {setListAt}
      setDelimiter={setDelimiterValue}
      compareAction={runCompare}
      swapAction={swapLists}
      clearAction={clearAll}
      sampleAction={loadSample}
      addListAction={addList}
      removeListAction={removeList}
      isRunning={running}
      toastAction={toast}
    />
  </section>

  <section class="card options" aria-label="Advanced options">
    <h2><SettingsIcon size={16} /> Advanced Comparison</h2>
    <div class="opt-grid">
      <label><input type="checkbox" bind:checked={options.caseSensitive} /> Case sensitive</label>
      <label><input type="checkbox" bind:checked={options.treatAsMultiset} /> Treat duplicates as multisets</label>
      <label><input type="checkbox" bind:checked={options.fuzzyMatch} /> Fuzzy match</label>
      <label><input type="checkbox" bind:checked={options.ignoreCommonWords} /> Ignore common words</label>
      <label>
        Fuzzy distance
        <input type="number" min="1" max="3" bind:value={options.fuzzyDistance} />
      </label>
      <label>
        Regex filter
        <input type="text" bind:value={options.regexFilter} placeholder="e.g. ^[A-Z]" />
      </label>
      <label>
        Sort mode
        <select bind:value={options.sortMode}>
          <option value="alphabetical">Alphabetical</option>
          <option value="original">Original order</option>
        </select>
      </label>
    </div>
  </section>

  <section class="card results-head">
    {#if lists.length === 2}
      <StatsPanel {result} />
    {:else if multiResult}
      <section class="multi-stats" aria-label="Multi-list statistics">
        <article><h3>Lists</h3><p>{multiResult.listCount}</p></article>
        <article><h3>Common To All</h3><p>{multiResult.intersectionAll.length}</p></article>
        <article><h3>Union</h3><p>{multiResult.union.length}</p></article>
        <article><h3>In 2+ Lists</h3><p>{multiResult.overlapAtLeastTwo.length}</p></article>
      </section>
    {:else}
      <section class="multi-stats" aria-label="Multi-list statistics">
        <article><h3>Status</h3><p>Run compare to see multi-list metrics.</p></article>
      </section>
    {/if}
    <div class="actions">
      <button
        type="button"
        onclick={() => {
          if (result) downloadJson('vennom-analysis.json', result);
          else if (multiResult) downloadJson('vennom-multilist-analysis.json', multiResult);
        }}
      ><DownloadIcon size={14} /> JSON</button>
      <button type="button" onclick={exportPng} disabled={lists.length !== 2}><DownloadIcon size={14} /> PNG</button>
      <button type="button" onclick={share} disabled={lists.length !== 2}><ShareIcon size={14} /> Share URL</button>
    </div>
  </section>

  <section class="card venn-region" bind:this={vennRef}>
    {#if running}
      <div class="progress-wrap" role="status" aria-live="polite">
        <div class="bar"><span style={`width:${Math.round(progress.value * 100)}%`}></span></div>
        <p>{progress.phase} ({Math.round(progress.value * 100)}%)</p>
      </div>
    {/if}
    {#if lists.length === 2}
      <VennDiagram {result} selectAction={selectRegion} />
    {:else}
      <section class="multi-breakdown" aria-label="Per-list breakdown">
        <h3>Per-list unique and exclusive counts</h3>
        {#if multiResult}
          <div class="breakdown-grid">
            {#each multiResult.perList as stat}
              <article>
                <h4>{stat.label}</h4>
                <p>Unique: {stat.uniqueCount}</p>
                <p>Exclusive: {stat.exclusiveCount}</p>
              </article>
            {/each}
          </div>
        {:else}
          <p>Run compare to generate multi-list breakdown.</p>
        {/if}
      </section>
    {/if}
  </section>
</main>

<ResultsModal
  open={modal.open}
  title={modal.title}
  items={modal.items}
  closeAction={() => (modal.open = false)}
  toastAction={toast}
/>
<Toast {toasts} dismiss={dismissToast} />

<style>
  .page {
    padding: 1.1rem 0 2rem;
    display: grid;
    gap: 0.9rem;
  }
  .top {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  h1 {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-family: var(--font-head);
    letter-spacing: 0.03em;
  }
  h2 {
    margin: 0 0 0.6rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 1rem;
  }
  p {
    color: var(--text-dim);
    margin: 0.3rem 0 0;
  }
  .privacy {
    margin-top: 0.7rem;
    color: #86efac;
    font-family: var(--font-mono);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
  }
  .prefs {
    display: grid;
    gap: 0.4rem;
    align-content: start;
    font-size: 0.85rem;
  }
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .quick-status {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.28rem 0.65rem;
    font-size: 0.78rem;
    color: var(--text-dim);
    font-family: var(--font-mono);
  }
  .opt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.6rem;
  }
  .opt-grid label {
    display: grid;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: var(--text-dim);
  }
  .opt-grid input,
  .opt-grid select {
    border: 1px solid var(--border);
    border-radius: 0.45rem;
    padding: 0.42rem 0.55rem;
    background: #090910;
  }
  .results-head {
    display: grid;
    gap: 0.6rem;
  }
  .multi-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.55rem;
  }
  .multi-stats article {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 0.6rem;
    padding: 0.7rem;
  }
  .multi-stats h3 {
    margin: 0 0 0.35rem;
    color: var(--text-dim);
    font-size: 0.75rem;
  }
  .multi-stats p {
    margin: 0;
    font-family: var(--font-mono);
  }
  .actions {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
  }
  .progress-wrap {
    margin-bottom: 0.5rem;
  }
  .bar {
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
  }
  .bar span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #0ea5a5, #84cc16);
    transition: width 0.2s ease;
  }
  .progress-wrap p {
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }
  .multi-breakdown h3 {
    margin: 0 0 0.6rem;
  }
  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.6rem;
  }
  .breakdown-grid article {
    border: 1px solid var(--border);
    border-radius: 0.55rem;
    padding: 0.6rem;
    background: var(--surface-2);
  }
  .breakdown-grid h4 {
    margin: 0 0 0.35rem;
  }
  .breakdown-grid p {
    margin: 0.2rem 0;
    font-family: var(--font-mono);
  }

  @media print {
    .prefs,
    .actions,
    button {
      display: none !important;
    }
    .card {
      border: 1px solid #000;
    }
  }
</style>
