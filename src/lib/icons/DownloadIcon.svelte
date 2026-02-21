<script lang="ts">
  let { size = 24, label = 'DownloadIcon' }: { size?: number; label?: string } = $props();
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
  <path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/>
</svg>
