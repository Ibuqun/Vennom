<script lang="ts">
  let {
    items,
    itemHeight = 34,
    height = 380,
    render
  }: {
    items: string[];
    itemHeight?: number;
    height?: number;
    render?: (item: string, index: number) => string;
  } = $props();

  let start = $state(0);
  const visibleCount = $derived(Math.ceil(height / itemHeight) + 12);
  const end = $derived(Math.min(items.length, start + visibleCount));
  const visible = $derived(items.slice(start, end));

  function onScroll(e: Event) {
    const target = e.currentTarget as HTMLElement;
    start = Math.max(0, Math.floor(target.scrollTop / itemHeight) - 6);
  }
</script>

<div class="virtual" style={`height:${height}px`} onscroll={onScroll}>
  <div class="spacer" style={`height:${items.length * itemHeight}px`}>
    <div class="slice" style={`transform: translateY(${start * itemHeight}px)`}>
      {#each visible as item, idx (start + idx)}
        <div class="row" style={`height:${itemHeight}px`}>
          {@html render ? render(item, start + idx) : `<span>${item}</span>`}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .virtual {
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--control-bg);
  }
  .spacer {
    position: relative;
  }
  .slice {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
  .row {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    border-bottom: 1px solid var(--row-divider);
    font-family: var(--font-mono);
    font-size: 0.88rem;
  }
</style>
