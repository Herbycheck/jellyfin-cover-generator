<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';

	import { JFApi } from '$lib/jfApi';

    import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	let libraries = $state<Array<JFLibrary>>();

	onMount(async () => {
		const baseUrl = localStorage.getItem('baseUrl') || '';
		const apiKey = localStorage.getItem('apiKey') || '';

		if (!(baseUrl.length > 0 && apiKey.length > 0)) redirect(303, '/');

		const api = new JFApi(baseUrl, apiKey);

		libraries = await api.getLibraries();
	});
</script>

{#each libraries as library}
	<a href={`/libraries/${library.id}`}>
		<h3>{library.name}</h3>
	</a>
{/each}
