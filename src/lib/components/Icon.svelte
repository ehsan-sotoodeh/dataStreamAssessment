<script lang="ts">
	import type { ComponentType } from 'svelte';

	interface Props {
		icon: ComponentType;
		size?: number;
		class?: string;
		color?: string;
		strokeWidth?: number;
	}

	let {
		icon: IconComponent,
		size = 24,
		class: className = '',
		color = 'currentColor',
		strokeWidth = 2
	}: Props = $props();
</script>

<IconComponent {size} class={className} style="color: {color}; stroke-width: {strokeWidth};" />
