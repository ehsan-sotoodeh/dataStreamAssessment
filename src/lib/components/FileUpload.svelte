<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Upload, FileText, X } from 'lucide-svelte';

	let fileInput: HTMLInputElement;
	let selectedFile: File | null = null;
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

		selectedFile = file;
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

	function clearFile() {
		selectedFile = null;
		columns = [];
		csvData = [];
		errorMessage = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div class="mx-auto w-full max-w-2xl">
	<div class="mb-6">
		<!-- File Upload Area -->
		<div
			role="button"
			tabindex="0"
			class="rounded-lg border-2 border-dashed p-8 text-center transition-colors {isDragging
				? 'border-blue-500 bg-blue-50'
				: 'border-gray-300 hover:border-gray-400'}"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<Upload size={48} class="mx-auto mb-4 text-gray-400" />
			<p class="mb-2 text-lg font-medium text-gray-600">Drag and drop your CSV file here</p>
			<p class="mb-4 text-gray-500">or</p>
			<button
				onclick={triggerFileInput}
				class="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
			>
				Browse Files
			</button>
			<p class="mt-2 text-sm text-gray-400">Supports .csv files only</p>
		</div>

		<!-- Hidden file input -->
		<input
			bind:this={fileInput}
			type="file"
			accept=".csv,text/csv"
			onchange={handleFileSelect}
			class="hidden"
		/>
	</div>

	<!-- Error Message -->
	{#if errorMessage}
		<div class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			{errorMessage}
		</div>
	{/if}

	<!-- File Info and Columns -->
	{#if selectedFile && columns.length > 0}
		<div class="rounded-lg border bg-white p-6 shadow-sm">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<FileText size={24} class="text-blue-500" />
					<div>
						<h3 class="text-lg font-semibold">{selectedFile.name}</h3>
						<p class="text-sm text-gray-500">
							{(selectedFile.size / 1024).toFixed(1)} KB
						</p>
					</div>
				</div>
				<button
					onclick={clearFile}
					class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					<X size={20} />
				</button>
			</div>
		</div>
	{/if}
</div>
