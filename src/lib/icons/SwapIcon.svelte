<script lang="ts">
  let { size = 24, label = 'SwapIcon' }: { size?: number; label?: string } = $props();
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
  <path d="M4 7h13"/><path d="m13 3 4 4-4 4"/><path d="M20 17H7"/><path d="m11 13-4 4 4 4"/>
</svg>
