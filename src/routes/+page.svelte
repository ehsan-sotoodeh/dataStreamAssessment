<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';

	let csvData: string[][] = [];
	let columns: string[] = [];
	let hasData = false;
	let selectedLocationId = '';
	let selectedLocationName = '';

	// Extract unique values for dropdowns
	$: locations =
		hasData &&
		columns.includes('MonitoringLocationID') &&
		columns.includes('MonitoringLocationName')
			? [
					...new Set(
						csvData
							.map((row) => {
								const idIndex = columns.indexOf('MonitoringLocationID');
								const nameIndex = columns.indexOf('MonitoringLocationName');
								const id = idIndex >= 0 ? row[idIndex] : '';
								const name = nameIndex >= 0 ? row[nameIndex] : '';
								const key = `${Math.random().toString(36).substr(2, 20)}`;
								return { id, name, key };
							})
							.filter((location) => location.id.trim() && location.name.trim())
					)
				].sort((a, b) => a.name.localeCompare(b.name))
			: [];

	function handleDataLoaded(event: CustomEvent<{ columns: string[]; data: string[][] }>) {
		columns = event.detail.columns;
		csvData = event.detail.data;
		hasData = true;
		selectedLocationId = '';
		selectedLocationName = '';
	}

	function handleLocationIdChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedLocationId = target.value;
		const location = locations.find((location) => location.id === selectedLocationId);
		selectedLocationName = location?.name || '';
	}
</script>

<svelte:head>
	<title>Data Stream Assessment</title>
</svelte:head>

<main class="mx-auto max-w-6xl p-6">
	<FileUpload on:dataLoaded={handleDataLoaded} />

	{#if hasData}
		<div class="mt-8">
			<h2 class="mb-6 text-2xl font-bold">Data Analysis</h2>

			<!-- Data Summary -->
			<div class="mb-6 rounded-lg bg-gray-50 p-4">
				<div class="mb-2 text-sm text-gray-600">
					Total rows: {csvData.length} | Total columns: {columns.length}
				</div>
			</div>

			<!-- Monitoring Location Dropdowns -->
			{#if locations.length > 0}
				<div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
					<!-- Monitoring Location ID Dropdown -->
					<div class="space-y-2">
						<label for="locationId" class="block text-sm font-medium text-gray-700">
							Monitoring Location ID
						</label>
						<select
							id="locationId"
							bind:value={selectedLocationId}
							onchange={handleLocationIdChange}
							class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select a Location ID</option>
							{#each locations as location (location.key)}
								<option value={location.id}>{location.id}: {location.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Selection Summary -->
				{#if selectedLocationId || selectedLocationName}
					<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<h3 class="mb-2 font-medium text-blue-900">Current Selection:</h3>
						<div class="space-y-1 text-sm text-blue-800">
							{#if selectedLocationId}
								<div>
									Location ID: <span class="font-mono"
										>{selectedLocationId} : {selectedLocationName}</span
									>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<p class="text-yellow-800">
						No MonitoringLocationID or MonitoringLocationName columns found in the CSV data.
					</p>
					<p class="mt-1 text-sm text-yellow-700">
						Available columns: {columns.join(', ')}
					</p>
				</div>
			{/if}
		</div>
	{/if}
</main>
