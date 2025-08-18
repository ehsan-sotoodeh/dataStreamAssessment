<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Upload, FileText, X, BarChart3, Columns, Database } from 'lucide-svelte';

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

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

		<!-- File Info and Statistics -->
		{#if selectedFile && columns.length > 0}
			<div class="flex-1">
				<div
					class="h-full rounded-lg border-2 border-dashed border-gray-300 bg-white p-3 shadow-sm"
				>
					<!-- File Header -->
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center space-x-2">
							<FileText size={16} class="text-blue-500" />
							<div>
								<h3 class="text-sm font-semibold text-gray-900">{selectedFile.name}</h3>
								<p class="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
							</div>
						</div>
						<button
							onclick={clearFile}
							class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						>
							<X size={14} />
						</button>
					</div>

					<!-- File Statistics -->
					<div class="grid grid-cols-3 gap-2">
						<div class="flex items-center space-x-1.5 rounded bg-blue-50 px-2 py-1.5">
							<BarChart3 size={12} class="text-blue-600" />
							<div class="text-xs">
								<p class="font-medium text-blue-900">{csvData.length.toLocaleString()}</p>
								<p class="text-blue-600">Rows</p>
							</div>
						</div>

						<div class="flex items-center space-x-1.5 rounded bg-green-50 px-2 py-1.5">
							<Columns size={12} class="text-green-600" />
							<div class="text-xs">
								<p class="font-medium text-green-900">{columns.length}</p>
								<p class="text-green-600">Columns</p>
							</div>
						</div>

						<div class="flex items-center space-x-1.5 rounded bg-purple-50 px-2 py-1.5">
							<Database size={12} class="text-purple-600" />
							<div class="text-xs">
								<p class="font-medium text-purple-900">
									{(csvData.length * columns.length).toLocaleString()}
								</p>
								<p class="text-purple-600">Cells</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
