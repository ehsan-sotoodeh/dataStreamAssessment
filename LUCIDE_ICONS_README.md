# Lucide Icons in Svelte

This project uses [Lucide Icons](https://lucide.dev/) as the primary icon library.

## Installation

```bash
npm install lucide-svelte
```

## Basic Usage

### Direct Import

```svelte
<script lang="ts">
	import { Heart, Star, Settings } from 'lucide-svelte';
</script>

<Heart size={24} />
<Star size={32} class="text-yellow-500" />
<Settings size={20} class="text-gray-600" />
```

### Icon Props

- `size`: Icon size in pixels (default: 24)
- `class`: CSS classes for styling
- `color`: Icon color (can use CSS color values or Tailwind classes)
- `strokeWidth`: Stroke width (default: 2)

## Custom Icon Component

We've created a reusable `Icon` component in `src/lib/components/Icon.svelte`:

```svelte
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { Heart } from 'lucide-svelte';
</script>

<Icon icon={Heart} size={32} color="#ef4444" strokeWidth={1.5} />
```

## Available Icons

Browse all available icons at [lucide.dev](https://lucide.dev/icons/).

### Common Icons

- **Navigation**: `Home`, `Menu`, `Search`, `Settings`
- **Actions**: `Download`, `Upload`, `Edit`, `Trash2`, `Save`
- **Status**: `CheckCircle`, `AlertCircle`, `Info`, `Warning`
- **User**: `User`, `Lock`, `Unlock`, `Eye`, `EyeOff`
- **Media**: `Play`, `Pause`, `Volume`, `Mute`
- **Communication**: `Mail`, `Phone`, `MessageCircle`, `Send`

## Examples in This Project

### Header Navigation

The layout file (`src/routes/+layout.svelte`) demonstrates icons in a navigation header.

### Interactive Elements

The main page (`src/routes/+page.svelte`) shows:

- Basic icon display
- Interactive icons (password toggle, lock toggle)
- Action buttons with icons
- Different icon sizes
- Color variations
- Custom icon component usage

## Styling Tips

### Colors

```svelte
<!-- Using Tailwind classes -->
<Heart class="text-red-500" />

<!-- Using custom colors -->
<Heart style="color: #ef4444;" />

<!-- Using the Icon component -->
<Icon icon={Heart} color="#ef4444" />
```

### Sizes

```svelte
<Heart size={16} />
<!-- Small -->
<Heart size={24} />
<!-- Default -->
<Heart size={32} />
<!-- Large -->
<Heart size={48} />
<!-- Extra Large -->
```

### Hover Effects

```svelte
<button class="rounded p-2 hover:bg-gray-100">
	<Settings size={20} class="text-gray-600 hover:text-gray-800" />
</button>
```

## Best Practices

1. **Tree Shaking**: Only import the icons you need
2. **Consistent Sizing**: Use consistent size values across your app
3. **Accessibility**: Add `aria-label` or `title` attributes when needed
4. **Performance**: Use the Icon component for complex icon configurations
5. **Semantic Colors**: Use colors that match the icon's meaning

## Troubleshooting

### Icon Not Showing

- Check that the icon name is correct
- Verify the import statement
- Ensure the icon exists in the lucide-svelte package

### Styling Issues

- Icons inherit text color by default
- Use `class` or `style` for custom colors
- Check that Tailwind classes are properly configured

## Resources

- [Lucide Icons Website](https://lucide.dev/)
- [Lucide GitHub Repository](https://github.com/lucide-icons/lucide)
- [Svelte Documentation](https://svelte.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/)
