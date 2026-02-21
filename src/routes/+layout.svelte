<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';
  import '$lib/styles/global.css';
  import '$lib/styles/animations.css';
  import '$lib/styles/utilities.css';

  onMount(() => {
    if (!dev || typeof window === 'undefined') return;

    // Avoid stale localhost builds: unregister SW and clear Cache Storage during dev.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
        .catch(() => {});
    }
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  });
</script>

<a class="skip-link" href="#main">Skip to content</a>
<slot />
