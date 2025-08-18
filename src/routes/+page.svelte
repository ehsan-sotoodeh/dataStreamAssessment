<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';
	import { onMount } from 'svelte';

	let csvData: string[][] = [];
	let columns: string[] = [];
	let hasData = false;
	let selectedLocationId = '';
	let selectedLocationName = '';
	let selectedCharacteristicName = '';
	let mapContainer: HTMLDivElement;
	import type { Map as LeafletMap } from 'leaflet';
	let map: LeafletMap | null = null;

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

	// Extract unique monitoring locations for map
	$: monitoringLocations = (() => {
		if (
			!hasData ||
			!columns.includes('MonitoringLocationID') ||
			!columns.includes('MonitoringLocationLatitude') ||
			!columns.includes('MonitoringLocationLongitude')
		) {
			return [];
		}

		const idIndex = columns.indexOf('MonitoringLocationID');
		const nameIndex = columns.indexOf('MonitoringLocationName');
		const latIndex = columns.indexOf('MonitoringLocationLatitude');
		const lngIndex = columns.indexOf('MonitoringLocationLongitude');

		const uniqueLocations: Record<string, { id: string; name: string; lat: number; lng: number }> =
			{};

		csvData.forEach((row) => {
			const id = row[idIndex];
			const name = row[nameIndex];
			const lat = parseFloat(row[latIndex]);
			const lng = parseFloat(row[lngIndex]);

			if (id && !isNaN(lat) && !isNaN(lng) && !uniqueLocations[id]) {
				uniqueLocations[id] = {
					id,
					name: name || id,
					lat,
					lng
				};
			}
		});

		return Object.values(uniqueLocations);
	})();

	// Calculate average ResultValue for selected location and characteristic
	$: averageResultValue = (() => {
		if (!hasData || !selectedLocationId || !selectedCharacteristicName) {
			return null;
		}

		const locationIdIndex = columns.indexOf('MonitoringLocationID');
		const characteristicIndex = columns.indexOf('CharacteristicName');
		const resultValueIndex = columns.indexOf('ResultValue');

		if (locationIdIndex === -1 || characteristicIndex === -1 || resultValueIndex === -1) {
			return null;
		}

		// Filter rows that match both the selected location and characteristic
		const matchingRows = csvData.filter((row) => {
			const locationId = row[locationIdIndex];
			const characteristic = row[characteristicIndex];
			const resultValue = row[resultValueIndex];

			return (
				locationId === selectedLocationId &&
				characteristic === selectedCharacteristicName &&
				resultValue &&
				!isNaN(parseFloat(resultValue))
			);
		});

		if (matchingRows.length === 0) {
			return null;
		}

		// Calculate average of ResultValue
		const sum = matchingRows.reduce((acc, row) => {
			return acc + parseFloat(row[resultValueIndex]);
		}, 0);

		return {
			average: sum / matchingRows.length,
			count: matchingRows.length,
			unit: matchingRows[0][columns.indexOf('ResultUnit')] || 'N/A'
		};
	})();

	// Initialize Leaflet map
	async function initializeMap() {
		if (!mapContainer || monitoringLocations.length === 0) return;

		// Dynamically import Leaflet
		const L = await import('leaflet');

		// Create map
		map = L.map(mapContainer).setView([49.0, -53.9], 10);

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(map);

		// Add markers for each monitoring location
		monitoringLocations.forEach((location) => {
			const marker = L.marker([location.lat, location.lng]).addTo(map).bindPopup(`
					<strong>${location.name}</strong><br>
					ID: ${location.id}<br>
					Lat: ${location.lat.toFixed(5)}<br>
					Lng: ${location.lng.toFixed(5)}
				`);

			// Add click event to set selected location
			marker.on('click', () => {
				selectedLocationId = location.id;
				selectedLocationName = location.name;
			});
		});

		// Fit map to show all markers
		if (monitoringLocations.length > 0) {
			const bounds = L.latLngBounds(monitoringLocations.map((loc) => L.latLng(loc.lat, loc.lng)));
			map.fitBounds(bounds.pad(0.1));
		}
	}

	// Watch for changes in monitoring locations and reinitialize map
	$: if (monitoringLocations.length > 0 && mapContainer) {
		// Small delay to ensure DOM is ready
		setTimeout(initializeMap, 100);
	}

	onMount(() => {
		// Import Leaflet CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
		link.crossOrigin = '';
		document.head.appendChild(link);
	});

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
	<title>Data Stream Assessment Dashboard</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
	<!-- Header Section -->
	<div class="border-b border-gray-200 bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between py-6">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Data Stream Assessment</h1>
					<p class="mt-1 text-sm text-gray-600">Environmental monitoring data analysis dashboard</p>
				</div>
				<div class="flex items-center space-x-3">
					<div class="h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
					<span class="text-sm text-gray-500">System Online</span>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- File Upload Section -->
		<div class="mb-6 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
			<FileUpload on:dataLoaded={handleDataLoaded} />
		</div>

		{#if hasData}
			<!-- Dashboard Grid -->
			<div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
				<!-- Data Summary Card -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
								<svg
									class="h-5 w-5 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Total Records</p>
							<p class="text-2xl font-bold text-gray-900">{csvData.length.toLocaleString()}</p>
						</div>
					</div>
				</div>

				<!-- Columns Card -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
								<svg
									class="h-5 w-5 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 10h16M4 14h16M4 18h16"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Data Columns</p>
							<p class="text-2xl font-bold text-gray-900">{columns.length}</p>
						</div>
					</div>
				</div>

				<!-- Locations Card -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
								<svg
									class="h-5 w-5 text-purple-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									></path>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									></path>
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<p class="text-sm font-medium text-gray-500">Monitoring Locations</p>
							<p class="text-2xl font-bold text-gray-900">
								{Object.keys(locationNameIdMap).length}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Analysis Section -->
			<div class="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
				<div class="mb-6">
					<h2 class="mb-2 text-2xl font-bold text-gray-900">Data Analysis</h2>
					<p class="text-gray-600">
						Select monitoring location and characteristic to analyze specific data points
					</p>
				</div>

				{#if Object.keys(locationNameIdMap).length > 0}
					<!-- Selection Controls -->
					<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
						<!-- Monitoring Location ID Dropdown -->
						<div class="space-y-2">
							<label for="locationId" class="block text-sm font-semibold text-gray-700">
								Monitoring Location ID
							</label>
							<div class="relative">
								<select
									id="locationId"
									bind:value={selectedLocationId}
									onchange={handleLocationIdChange}
									class="focus:ring-opacity-50 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								>
									<option value="">Select a Location ID</option>
									{#each Object.keys(locationNameIdMap) as location (location)}
										<option value={location}>{location}: {locationNameIdMap[location]}</option>
									{/each}
								</select>
								<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</div>
							</div>
						</div>

						<!-- Characteristic Name Dropdown -->
						<div class="space-y-2">
							<label for="characteristicName" class="block text-sm font-semibold text-gray-700">
								Characteristic Name
							</label>
							<div class="relative">
								<select
									id="characteristicName"
									bind:value={selectedCharacteristicName}
									onchange={handleCharacteristicNameChange}
									class="focus:ring-opacity-50 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								>
									<option value="">Select a Characteristic Name</option>
									{#each characteristicNames as char (char)}
										<option value={char}>{char}</option>
									{/each}
								</select>
								<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</div>
							</div>
						</div>
					</div>

					<!-- Selection Summary -->
					{#if selectedLocationId || selectedLocationName}
						<div
							class="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
						>
							<div class="mb-3 flex items-center">
								<div class="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
									<svg
										class="h-4 w-4 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
								</div>
								<h3 class="text-lg font-semibold text-blue-900">Current Selection</h3>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								{#if selectedLocationId}
									<div class="rounded-lg border border-blue-200 bg-white p-3">
										<p class="text-xs font-medium tracking-wide text-blue-600 uppercase">
											Location ID
										</p>
										<p class="text-sm font-semibold text-blue-900">
											{selectedLocationId}: {selectedLocationName}
										</p>
									</div>
								{/if}
								{#if selectedCharacteristicName}
									<div class="rounded-lg border border-blue-200 bg-white p-3">
										<p class="text-xs font-medium tracking-wide text-blue-600 uppercase">
											Characteristic
										</p>
										<p class="text-sm font-semibold text-blue-900">{selectedCharacteristicName}</p>
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Analysis Results -->
					{#if averageResultValue}
						<div
							class="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6"
						>
							<div class="mb-4 flex items-center">
								<div
									class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100"
								>
									<svg
										class="h-5 w-5 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
								</div>
								<h3 class="text-xl font-bold text-green-900">Analysis Results</h3>
							</div>
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="rounded-lg border border-green-200 bg-white p-4">
									<p class="mb-1 text-sm font-medium text-green-600">
										Average {selectedCharacteristicName}
									</p>
									<p class="font-mono text-2xl font-bold text-green-900">
										{averageResultValue.average.toFixed(2)}
										{averageResultValue.unit}
									</p>
								</div>
								<div class="rounded-lg border border-green-200 bg-white p-4">
									<p class="mb-1 text-sm font-medium text-green-600">Measurements</p>
									<p class="text-2xl font-bold text-green-900">{averageResultValue.count}</p>
								</div>
							</div>
						</div>
					{:else if selectedLocationId && selectedCharacteristicName}
						<div
							class="rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6"
						>
							<div class="flex items-center">
								<div
									class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100"
								>
									<svg
										class="h-5 w-5 text-yellow-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
										></path>
									</svg>
								</div>
								<div>
									<h3 class="text-lg font-semibold text-yellow-800">No Data Found</h3>
									<p class="mt-1 text-sm text-yellow-700">
										No numeric ResultValue data found for the selected location and characteristic
										combination.
									</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- Map Section -->
					{#if monitoringLocations.length > 0}
						<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
							<h3 class="mb-4 text-xl font-bold text-gray-900">Monitoring Locations Map</h3>
							<div
								bind:this={mapContainer}
								class="w-full rounded-lg border border-gray-300"
								style="height: 400px; min-height: 400px;"
							></div>
							<p class="mt-2 text-sm text-gray-600">
								Showing {monitoringLocations.length} unique monitoring locations. Click any marker to
								select that location.
							</p>
						</div>
					{/if}
				{:else}
					<div
						class="rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6"
					>
						<div class="flex items-center">
							<div class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
								<svg
									class="h-5 w-5 text-yellow-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									></path>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-yellow-800">Missing Required Columns</h3>
								<p class="mt-1 text-sm text-yellow-700">
									No MonitoringLocationID or MonitoringLocationName columns found in the CSV data.
								</p>
								<p class="mt-2 text-xs text-yellow-600">
									Available columns: {columns.join(', ')}
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</main>
