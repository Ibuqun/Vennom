<script lang="ts">
  import type { ComparisonResult } from '$lib/utils/sets';

  let { result }: { result: ComparisonResult | null } = $props();

  const cards = $derived(
    result
      ? [
          ['|A|', result.stats.sizeA],
          ['|B|', result.stats.sizeB],
          ['|A∩B|', result.stats.intersection],
          ['|A∪B|', result.stats.union],
          ['|A-B|', result.stats.onlyA],
          ['|B-A|', result.stats.onlyB],
          ['Jaccard', result.stats.jaccard.toFixed(4)]
        ]
      : []
  );
</script>

<section class="stats" aria-label="Comparison statistics">
  {#if !result}
    <div class="empty">Run compare to see metrics.</div>
  {:else}
    {#each cards as [label, value]}
      <article data-testid={`stat-${String(label).replace(/[^a-z0-9]+/gi, '').toLowerCase()}`}>
        <h3>{label}</h3>
        <p>{value}</p>
      </article>
    {/each}
  {/if}
</section>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.65rem;
  }
  article,
  .empty {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 0.6rem;
    padding: 0.8rem;
  }
  h3 {
    font-size: 0.75rem;
    color: var(--text-dim);
    margin: 0 0 0.3rem;
    font-family: var(--font-mono);
  }
  p {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 1.1rem;
  }
</style>
