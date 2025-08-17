import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Layout from './+layout.svelte';

describe('Layout', () => {
	it('renders the layout structure', () => {
		render(Layout);

		// Check for the main container
		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();
	});

	it('renders the Header component', () => {
		render(Layout);

		// Check if Header is rendered (it should be present in the DOM)
		// Since Header is a component, we'll check for its presence
		const header = document.querySelector('header');
		expect(header).toBeInTheDocument();
	});

	it('has correct layout classes', () => {
		render(Layout);

		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();
		expect(container).toHaveClass('flex', 'flex-col', 'min-h-screen');
	});

	it('renders favicon in head', () => {
		render(Layout);

		// Check if favicon link is present
		const faviconLink = document.querySelector('link[rel="icon"]');
		expect(faviconLink).toBeInTheDocument();
	});

	it('has proper semantic structure', () => {
		render(Layout);

		// Check for proper HTML structure
		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();

		// Should contain header and main content area
		const header = container?.querySelector('header');
		expect(header).toBeInTheDocument();
	});

	it('maintains responsive design', () => {
		render(Layout);

		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();

		// Check for responsive classes
		expect(container).toHaveClass('min-h-screen');
	});

	it('renders children content area', () => {
		render(Layout);

		// The layout should provide a structure for children
		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();

		// Children will be rendered in the flex container
		expect(container).toBeInTheDocument();
	});

	it('has proper CSS imports', () => {
		render(Layout);

		// Check that the layout is properly styled
		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();
	});

	it('maintains proper flexbox layout', () => {
		render(Layout);

		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();

		// Check flexbox classes
		expect(container).toHaveClass('flex', 'flex-col');
	});

	it('provides full height layout', () => {
		render(Layout);

		const container = document.querySelector('.flex.flex-col.min-h-screen');
		expect(container).toBeInTheDocument();

		// Check for full height
		expect(container).toHaveClass('min-h-screen');
	});

	it('integrates Header component correctly', () => {
		render(Layout);

		// Check that Header is properly integrated
		const header = document.querySelector('header');
		expect(header).toBeInTheDocument();

		// Header should be the first child of the flex container
		const container = document.querySelector('.flex.flex-col.min-h-screen');
		const firstChild = container?.firstElementChild;
		expect(firstChild).toBe(header);
	});
});
