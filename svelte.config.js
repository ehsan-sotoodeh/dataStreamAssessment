// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isProd = process.env.NODE_ENV === 'production';
// If this is a *project page* (not username.github.io), base must be "/<repo-name>"
const projectBase = '/dataStreamAssessment';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html' // SPA routing on GitHub Pages
		}),
		paths: {
			base: isProd ? projectBase : ''
		}
	}
};

export default config;
