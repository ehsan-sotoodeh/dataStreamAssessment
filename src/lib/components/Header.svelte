<script lang="ts">
	import { House, Settings, User, Search, Menu } from 'lucide-svelte';
</script>

<header class="bg-gray-800 p-4 text-white">
	<div class="mx-auto flex max-w-6xl items-center justify-between">
		<div class="flex items-center space-x-2">
			<House size={24} />
			<h1 class="text-xl font-bold">Data Stream Assessment</h1>
		</div>
		<nav class="flex items-center space-x-4">
			<button class="rounded p-2 hover:bg-gray-700">
				<Search size={20} />
			</button>
			<button class="rounded p-2 hover:bg-gray-700">
				<Settings size={20} />
			</button>
			<button class="rounded p-2 hover:bg-gray-700">
				<User size={20} />
			</button>
			<button class="rounded p-2 hover:bg-gray-700">
				<Menu size={20} />
			</button>
		</nav>
	</div>
</header>
