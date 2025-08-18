<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';

	let csvData: string[][] = [];
	let columns: string[] = [];
	let hasData = false;
	let selectedLocationId = '';
	let selectedLocationName = '';
	let selectedCharacteristicName = '';

	// Extract unique values for dropdowns
	$: locationNameIdMap =
		hasData &&
		columns.includes('MonitoringLocationID') &&
		columns.includes('MonitoringLocationName')
			? csvData.reduce(
					(acc, row) => {
						const id = row[columns.indexOf('MonitoringLocationID')];
						const name = row[columns.indexOf('MonitoringLocationName')];
						if (id && name) {
							acc[id] = name;
						}
						return acc;
					},
					{} as Record<string, string>
				)
			: {};

	console.log('locationNameIdMap', locationNameIdMap);

	$: characteristicNames =
		hasData && columns.includes('CharacteristicName')
			? [
					...new Set(
						csvData.map((row) => {
							const charIndex = columns.indexOf('CharacteristicName');
							return charIndex >= 0 ? row[charIndex] : '';
						})
					)
				].sort()
			: [];

	function handleDataLoaded(event: CustomEvent<{ columns: string[]; data: string[][] }>) {
		columns = event.detail.columns;
		csvData = event.detail.data;
		hasData = true;
		selectedLocationId = '';
		selectedLocationName = '';
		selectedCharacteristicName = '';
	}

	function handleLocationIdChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedLocationId = target.value;
		selectedLocationName = locationNameIdMap[selectedLocationId];
	}

	function handleCharacteristicNameChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedCharacteristicName = target.value;
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
			{#if Object.keys(locationNameIdMap).length > 0}
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
							{#each Object.keys(locationNameIdMap) as location (location)}
								<option value={location}>{location}: {locationNameIdMap[location]}</option>
							{/each}
						</select>
					</div>

					<!-- Characteristic Name Dropdown -->
					<div class="space-y-2">
						<label for="characteristicName" class="block text-sm font-medium text-gray-700">
							Characteristic Name
						</label>
						<select
							id="characteristicName"
							bind:value={selectedCharacteristicName}
							onchange={handleCharacteristicNameChange}
							class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select a Characteristic Name</option>
							{#each characteristicNames as char (char)}
								<option value={char}>{char}</option>
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
							{#if selectedCharacteristicName}
								<div>
									Characteristic Name: <span class="font-mono">{selectedCharacteristicName}</span>
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
