<script lang="ts">
  let { size = 24, label = 'FilterIcon' }: { size?: number; label?: string } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="currentColor"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  role="img"
  aria-label={label}
>
  <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/>
</svg>
