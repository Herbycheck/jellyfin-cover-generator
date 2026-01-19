<script lang="ts">
	import { JFApi } from '$lib/jfApi';

	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	let libraryContent = $state<Array<any>>();

	let baseUrl = '';

	onMount(async () => {
		baseUrl = localStorage.getItem('baseUrl') || '';
		const apiKey = localStorage.getItem('apiKey') || '';

		if (!(baseUrl.length > 0 && apiKey.length > 0) || !page.params.id) redirect(303, '/');

		const api = new JFApi(baseUrl, apiKey);
		libraryContent = await api.getLibraryImages(page.params.id);
	});
</script>

{#each libraryContent as item}
	<div>
		<h3>{item.Name}</h3>
		<img
			src={item.imageUrl}
			class="h-32 rounded-md"
			alt="Library Cover"
		/>
	</div>
{/each}
