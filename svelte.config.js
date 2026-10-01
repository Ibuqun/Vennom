import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.NODE_ENV === 'production' ? '/vennom' : '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html',
      precompress: true
    }),
    paths: {
      base,
      relative: false
    },
    alias: {
      $lib: 'src/lib'
    }
  }
};

export default config;
