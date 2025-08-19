<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Upload } from 'lucide-svelte';

	let fileInput: HTMLInputElement;
	let columns: string[] = [];
	let csvData: string[][] = [];
	let isDragging = false;
	let errorMessage = '';

	const dispatch = createEventDispatcher<{
		dataLoaded: { columns: string[]; data: string[][] };
	}>();

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files && files.length > 0) {
			processFile(files[0]);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			processFile(files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function processFile(file: File) {
		errorMessage = '';

		if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
			errorMessage = 'Please select a valid CSV file';
			return;
		}

		readCSVColumns(file);
	}

	function readCSVColumns(file: File) {
		const reader = new FileReader();

		reader.onload = (e) => {
			const content = e.target?.result as string;
			const lines = content.split('\n').filter((line) => line.trim());

			if (lines.length > 0) {
				// Parse first line as headers, handle quoted values
				const firstLine = lines[0];
				columns = parseCSVLine(firstLine);

				// Parse all data rows
				csvData = lines.slice(1).map((line) => parseCSVLine(line));

				// Emit data to parent component
				dispatch('dataLoaded', { columns, data: csvData });
			}
		};

		reader.onerror = () => {
			errorMessage = 'Error reading file';
		};

		reader.readAsText(file);
	}

	function parseCSVLine(line: string): string[] {
		const result: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === ',' && !inQuotes) {
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}

		// Add the last column
		result.push(current.trim());

		return result;
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div class="mx-auto w-full max-w-4xl">
	<div class="flex flex-col gap-4 lg:flex-row">
		<!-- File Upload Area -->
		<div class="flex-1">
			<div
				role="button"
				tabindex="0"
				class="rounded-lg border-2 border-dashed p-4 text-center transition-colors {isDragging
					? 'border-blue-500 bg-blue-50'
					: 'border-gray-300 hover:border-gray-400'}"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
			>
				<Upload size={24} class="mx-auto mb-2 text-gray-400" />
				<p class="mb-2 text-sm font-medium text-gray-600">Drop CSV file here</p>
				<p class="mb-2 text-xs text-gray-500">or</p>
				<button
					onclick={triggerFileInput}
					class="rounded-md bg-blue-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-600"
				>
					Browse Files
				</button>
				<p class="mt-1 text-xs text-gray-400">CSV files only</p>
			</div>

			<!-- Hidden file input -->
			<input
				bind:this={fileInput}
				type="file"
				accept=".csv,text/csv"
				onchange={handleFileSelect}
				class="hidden"
			/>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
					{errorMessage}
				</div>
			{/if}
		</div>
	</div>
</div>
