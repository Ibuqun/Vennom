<script lang="ts">
  let { size = 24, label = 'InfoIcon' }: { size?: number; label?: string } = $props();
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
  <circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><circle cx="12" cy="7" r="1"/>
</svg>
