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
		libraryContent = await api.getLibraryItems(page.params.id);
	});

	const render = () => {
		console.log("Rendering")
	}
</script>

<button onclick={render}>
	Render
</button>

<table>
	<tbody>
		<tr>
			<th>Title</th>
		</tr>
		{#each libraryContent as item}
			<tr><td>{item.name}</td></tr>
		{/each}
	</tbody>
</table>
