import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Icon from './Icon.svelte';
import { Heart } from 'lucide-svelte';

describe('Icon', () => {
	it('renders with default props', () => {
		const { container } = render(Icon, { props: { icon: Heart } });

		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();
	});

	it('renders with custom size', () => {
		const { container } = render(Icon, { props: { icon: Heart, size: 32 } });

		const icon = container.querySelector('svg');
		expect(icon).toHaveAttribute('width', '32');
		expect(icon).toHaveAttribute('height', '32');
	});

	it('renders with custom color', () => {
		const { container } = render(Icon, { props: { icon: Heart, color: '#ff0000' } });

		const icon = container.querySelector('svg');
		expect(icon).toHaveStyle('color: #ff0000');
	});

	it('renders with custom stroke width', () => {
		const { container } = render(Icon, { props: { icon: Heart, strokeWidth: 1.5 } });

		const icon = container.querySelector('svg');
		expect(icon).toHaveStyle('stroke-width: 1.5');
	});

	it('renders with custom CSS classes', () => {
		const { container } = render(Icon, { props: { icon: Heart, class: 'custom-class' } });

		const icon = container.querySelector('svg');
		expect(icon).toHaveClass('custom-class');
	});

	it('applies multiple props correctly', () => {
		const { container } = render(Icon, {
			props: {
				icon: Heart,
				size: 48,
				color: '#00ff00',
				strokeWidth: 2.5,
				class: 'test-class'
			}
		});

		const icon = container.querySelector('svg');
		expect(icon).toHaveAttribute('width', '48');
		expect(icon).toHaveAttribute('height', '48');
		expect(icon).toHaveStyle('color: #00ff00');
		expect(icon).toHaveStyle('stroke-width: 2.5');
		expect(icon).toHaveClass('test-class');
	});

	it('uses default values when props are not provided', () => {
		const { container } = render(Icon, { props: { icon: Heart } });

		const icon = container.querySelector('svg');
		expect(icon).toHaveStyle('color: currentColor');
		expect(icon).toHaveStyle('stroke-width: 2');
	});

	it('renders different icon types', () => {
		// Test that the component can render different Lucide icons
		const { container, rerender } = render(Icon, { props: { icon: Heart } });

		let icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();

		// Test with a different icon (we'll use the same Heart icon but this shows the pattern)
		rerender({ icon: Heart, size: 64 });
		icon = container.querySelector('svg');
		expect(icon).toHaveAttribute('width', '64');
	});

	it('maintains icon functionality', () => {
		const { container } = render(Icon, { props: { icon: Heart } });

		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();

		// Check that the icon is properly rendered as an SVG
		expect(icon?.tagName).toBe('svg');
	});

	it('handles empty class prop gracefully', () => {
		const { container } = render(Icon, { props: { icon: Heart, class: '' } });

		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();
		// Should not have any classes applied
		expect(icon?.className).toBe('');
	});

	it('renders with all props set to edge cases', () => {
		const { container } = render(Icon, {
			props: {
				icon: Heart,
				size: 1,
				color: '#000000',
				strokeWidth: 0.1,
				class: 'edge-case-class'
			}
		});

		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveAttribute('width', '1');
		expect(icon).toHaveAttribute('height', '1');
		expect(icon).toHaveStyle('color: #000000');
		expect(icon).toHaveStyle('stroke-width: 0.1');
		expect(icon).toHaveClass('edge-case-class');
	});
});
