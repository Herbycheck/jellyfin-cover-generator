<script lang="ts">
	import { JFApi } from '$lib/jfApi';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	let libraries = $state<Array<any>>();

	onMount(async () => {
		const baseUrl = localStorage.getItem('baseUrl') || '';
		const apiKey = localStorage.getItem('apiKey') || '';

		if (!(baseUrl.length > 0 && apiKey.length > 0)) redirect(303, '/');

		const api = new JFApi(baseUrl, apiKey);

		libraries = await api.getLibraries();

		console.log(libraries);
	});
</script>

{#each libraries as library}
	<a href={`/libraries/${library.ItemId}`}>
		<h3>{library.Name}</h3>
	</a>
{/each}
