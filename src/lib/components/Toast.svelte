<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import InfoIcon from '$lib/icons/InfoIcon.svelte';
  import WarningIcon from '$lib/icons/WarningIcon.svelte';
  import CheckIcon from '$lib/icons/CheckIcon.svelte';

  export type ToastType = 'info' | 'success' | 'error';
  export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
  }

  let { toasts = [], dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void } = $props();
</script>

<div class="toast-stack" aria-live="polite" aria-atomic="true">
  {#each toasts as toast (toast.id)}
    <div class={`toast ${toast.type}`} in:fly={{ y: 12, duration: 180 }} out:fade={{ duration: 140 }}>
      {#if toast.type === 'success'}
        <CheckIcon label="success" size={18} />
      {:else if toast.type === 'error'}
        <WarningIcon label="error" size={18} />
      {:else}
        <InfoIcon label="info" size={18} />
      {/if}
      <span>{toast.message}</span>
      <button type="button" onclick={() => dismiss(toast.id)} aria-label="Dismiss toast">×</button>
    </div>
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 50;
    display: grid;
    gap: 0.5rem;
    max-width: 24rem;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--toast-bg);
    border: 1px solid rgba(14, 165, 165, 0.45);
    box-shadow: 0 0 14px rgba(14, 165, 165, 0.25);
    color: var(--toast-text);
    padding: 0.65rem 0.8rem;
    border-radius: 0.45rem;
  }
  .toast.success {
    border-color: rgba(16, 185, 129, 0.55);
  }
  .toast.error {
    border-color: rgba(239, 68, 68, 0.65);
  }
  button {
    margin-left: auto;
    color: inherit;
    background: transparent;
    border: 0;
    cursor: pointer;
  }
</style>
