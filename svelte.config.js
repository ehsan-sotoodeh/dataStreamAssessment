import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use static adapter instead of auto
		adapter: adapter({
			// You can customize these if needed
			// default options are shown below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // ensures SPA routing works
			precompress: false
		})
	}
};

export default config;
