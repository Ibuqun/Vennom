<script lang="ts">
  import type { ComparisonResult } from '$lib/utils/sets';

  let {
    result,
    selectAction
  }: {
    result: ComparisonResult | null;
    selectAction: (region: 'onlyA' | 'intersection' | 'onlyB') => void;
  } = $props();

  let hovered = $state<'onlyA' | 'intersection' | 'onlyB' | null>(null);
  const total = $derived(result ? result.stats.union || 1 : 1);

  function pct(v: number) {
    return ((v / total) * 100).toFixed(1);
  }
</script>

<section class="venn-wrap" aria-label="Interactive Venn diagram">
  {#if !result}
    <div class="empty-state">
      <h2>Vennom</h2>
      <p>Paste or drop two lists, then compare to reveal overlap.</p>
    </div>
  {:else}
    <svg viewBox="0 0 400 240" class="venn" role="img" aria-label="Venn diagram for comparison">
      <g>
        <circle
          cx="150"
          cy="120"
          r="82"
          class:active={hovered === 'onlyA'}
          role="button"
          tabindex="0"
          aria-label="A-only region"
          onmouseenter={() => (hovered = 'onlyA')}
          onmouseleave={() => (hovered = null)}
          onclick={() => selectAction('onlyA')}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAction('onlyA')}
        />
        <circle
          cx="250"
          cy="120"
          r="82"
          class:active={hovered === 'onlyB'}
          role="button"
          tabindex="0"
          aria-label="B-only region"
          onmouseenter={() => (hovered = 'onlyB')}
          onmouseleave={() => (hovered = null)}
          onclick={() => selectAction('onlyB')}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAction('onlyB')}
        />
      </g>
      <g
        role="button"
        tabindex="0"
        aria-label="Open items only in A"
        class="clickable-group"
        onclick={() => selectAction('onlyA')}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAction('onlyA')}
      >
        <text x="108" y="123" class="clickable-text">{result.stats.onlyA}</text>
        <text x="95" y="145" class="clickable-text">{pct(result.stats.onlyA)}%</text>
      </g>
      <g
        role="button"
        tabindex="0"
        aria-label="Open items only in B"
        class="clickable-group"
        onclick={() => selectAction('onlyB')}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAction('onlyB')}
      >
        <text x="285" y="123" class="clickable-text">{result.stats.onlyB}</text>
        <text x="275" y="145" class="clickable-text">{pct(result.stats.onlyB)}%</text>
      </g>
      <g
        role="button"
        tabindex="0"
        aria-label="Open items in the intersection"
        class="clickable-group"
        onclick={() => selectAction('intersection')}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAction('intersection')}
      >
        <text x="200" y="123" class="clickable-text">{result.stats.intersection}</text>
        <text x="190" y="145" class="clickable-text">{pct(result.stats.intersection)}%</text>
      </g>
      <ellipse
        cx="200"
        cy="120"
        rx="32"
        ry="82"
        class="intersection-hit"
        role="button"
        tabindex="0"
        aria-label="Intersection region"
        onmouseenter={() => (hovered = 'intersection')}
        onmouseleave={() => (hovered = null)}
        onclick={() => selectAction('intersection')}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAction('intersection')}
      />
    </svg>

    {#if hovered}
      <div class="tooltip" role="status">
        {#if hovered === 'onlyA'}
          A only: {result.stats.onlyA}
        {:else if hovered === 'onlyB'}
          B only: {result.stats.onlyB}
        {:else}
          Overlap: {result.stats.intersection}
        {/if}
      </div>
    {/if}
  {/if}
</section>

<style>
  .venn-wrap {
    background: radial-gradient(circle at 25% 20%, rgba(14, 165, 165, 0.2), transparent 55%), var(--surface);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
    position: relative;
    min-height: 280px;
  }
  .venn {
    width: 100%;
    max-height: 300px;
  }
  circle {
    fill: rgba(20, 184, 166, 0.3);
    stroke: rgba(45, 212, 191, 0.85);
    stroke-width: 2;
    transition: all 220ms cubic-bezier(0.2, 0.6, 0.2, 1);
    cursor: pointer;
  }
  circle.active,
  circle:hover {
    fill: rgba(132, 204, 22, 0.34);
    stroke: rgba(163, 230, 53, 0.95);
  }
  .intersection-hit {
    fill: transparent;
    stroke: transparent;
    pointer-events: all;
    cursor: pointer;
  }
  text {
    fill: var(--venn-text);
    font-size: 14px;
    font-family: var(--font-mono);
    text-anchor: middle;
  }
  .clickable-text {
    cursor: pointer;
    pointer-events: none;
  }
  .clickable-text:hover {
    fill: #d9f99d;
  }
  .clickable-group:focus .clickable-text,
  .clickable-group:hover .clickable-text {
    fill: #d9f99d;
  }
  .tooltip {
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    background: var(--tooltip-bg);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.4rem 0.6rem;
  }
  .empty-state {
    text-align: center;
    color: var(--text-dim);
    margin-top: 2.8rem;
  }
</style>
