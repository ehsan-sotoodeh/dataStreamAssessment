import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./vitest-setup-client.ts'],
		globals: true,
		testEnvironmentOptions: {
			jsdom: {
				resources: 'usable'
			}
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'.svelte-kit/',
				'coverage/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/vite-env.d.ts'
			]
		}
	}
});
