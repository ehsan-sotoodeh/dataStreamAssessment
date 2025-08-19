import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';

describe('Page UI - Download Link', () => {
	it('should include a download link to /data.csv with download attribute', () => {
		const filePath = resolve(__dirname, '+page.svelte');
		const content = readFileSync(filePath, 'utf-8');

		expect(content).toContain('href="/data.csv"');
		expect(content).toContain('download="data.csv"');
	});

	it('should include an accessible button label for downloading sample CSV', () => {
		const filePath = resolve(__dirname, '+page.svelte');
		const content = readFileSync(filePath, 'utf-8');

		// Ensure the visible text is present
		expect(content).toContain('Download Sample CSV');
	});

	it('should use a two-column responsive layout for upload and download sections', () => {
		const filePath = resolve(__dirname, '+page.svelte');
		const content = readFileSync(filePath, 'utf-8');

		// Basic heuristic: upload section spans 2 columns, download section spans 1 on large screens
		expect(content).toContain('lg:col-span-2');
		expect(content).toContain('lg:col-span-1');
	});
});

describe('Static Assets', () => {
	it('should have a static data.csv available for download', () => {
		const staticCsvPath = resolve(process.cwd(), 'static', 'data.csv');
		expect(existsSync(staticCsvPath)).toBe(true);
		const stats = statSync(staticCsvPath);
		expect(stats.isFile()).toBe(true);
		expect(stats.size).toBeGreaterThan(0);
	});
});
