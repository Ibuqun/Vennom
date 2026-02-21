<script lang="ts">
  let { size = 24, label = 'WarningIcon' }: { size?: number; label?: string } = $props();
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
  <path d="M12 3 2.6 19a1 1 0 0 0 .9 1.5h17a1 1 0 0 0 .9-1.5L12 3Z"/><path d="M12 9v5"/><circle cx="12" cy="17" r="1"/>
</svg>
