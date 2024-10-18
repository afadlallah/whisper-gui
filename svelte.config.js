import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  },
  vite: () => ({
    server: {
      fs: {
        allow: ['.']
      }
    },
    ssr: {
      noExternal: ['@sveltejs/kit']
    }
  })
};

export default config;
