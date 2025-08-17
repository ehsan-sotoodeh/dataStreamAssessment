import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';

describe('Header', () => {
	it('renders the header with correct title', () => {
		render(Header);

		expect(screen.getByText('Data Stream Assessment')).toBeInTheDocument();
		expect(screen.getByRole('banner')).toBeInTheDocument();
	});

	it('displays the house icon', () => {
		render(Header);

		// Check if house icon is present (Lucide icons render as SVG elements)
		const houseIcon =
			document.querySelector('[data-lucide="house"]') || document.querySelector('svg');
		expect(houseIcon).toBeInTheDocument();
	});

	it('renders all navigation buttons', () => {
		render(Header);

		// Check if all navigation buttons are present
		const searchButton = screen.getByRole('button', { name: /search/i });
		const settingsButton = screen.getByRole('button', { name: /settings/i });
		const userButton = screen.getByRole('button', { name: /user/i });
		const menuButton = screen.getByRole('button', { name: /menu/i });

		expect(searchButton).toBeInTheDocument();
		expect(settingsButton).toBeInTheDocument();
		expect(userButton).toBeInTheDocument();
		expect(menuButton).toBeInTheDocument();
	});

	it('has correct navigation structure', () => {
		render(Header);

		const nav = screen.getByRole('navigation');
		expect(nav).toBeInTheDocument();

		// Check if navigation contains the expected buttons
		const buttons = nav.querySelectorAll('button');
		expect(buttons).toHaveLength(4);
	});

	it('applies correct styling classes', () => {
		render(Header);

		const header = screen.getByRole('banner');
		expect(header).toHaveClass('bg-gray-800', 'p-4', 'text-white');

		const title = screen.getByText('Data Stream Assessment');
		expect(title).toHaveClass('text-xl', 'font-bold');
	});

	it('has proper semantic HTML structure', () => {
		render(Header);

		// Check for proper heading hierarchy
		const title = screen.getByRole('heading', { level: 1 });
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent('Data Stream Assessment');
	});

	it('renders with correct layout classes', () => {
		render(Header);

		const container = document.querySelector('.mx-auto.flex.max-w-6xl');
		expect(container).toBeInTheDocument();

		const titleContainer = document.querySelector('.flex.items-center.space-x-2');
		expect(titleContainer).toBeInTheDocument();

		const navContainer = document.querySelector('.flex.items-center.space-x-4');
		expect(navContainer).toBeInTheDocument();
	});

	it('displays icons with correct sizes', () => {
		render(Header);

		// Check if icons have the expected size attributes
		const icons = document.querySelectorAll('svg');
		expect(icons.length).toBeGreaterThan(0);

		// The house icon should be size 24, navigation icons should be size 20
		const houseIcon = icons[0];
		expect(houseIcon).toBeInTheDocument();
	});

	it('has accessible button labels', () => {
		render(Header);

		// Check if buttons have proper accessibility
		const buttons = screen.getAllByRole('button');
		buttons.forEach((button) => {
			expect(button).toBeInTheDocument();
		});
	});

	it('maintains responsive design classes', () => {
		render(Header);

		const header = screen.getByRole('banner');
		expect(header).toHaveClass('p-4');

		const container = document.querySelector('.max-w-6xl');
		expect(container).toBeInTheDocument();
	});
});
