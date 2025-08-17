<script lang="ts">
	import FileUpload from '$lib/components/FileUpload.svelte';

	let csvData: string[][] = [];
	let hasData = false;

	function handleDataLoaded(event: CustomEvent<{ columns: string[]; data: string[][] }>) {
		csvData = event.detail.data;
		hasData = true;
	}
</script>

<svelte:head>
	<title>Data Stream Assessment</title>
</svelte:head>

<main class="mx-auto max-w-6xl p-6">
	<FileUpload on:dataLoaded={handleDataLoaded} />

	{#if hasData}
		<div class="mt-8">
			<div class="mt-4 text-sm text-gray-600">
				Total rows: {csvData.length}
			</div>
		</div>
	{/if}
</main>
