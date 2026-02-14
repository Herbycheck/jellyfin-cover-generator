<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';

	import { JFApi } from '$lib/jfApi';

	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import Libraries from '$lib/components/Library/Libraries.svelte';

	let libraries = $state<Array<JFLibrary>>();

	onMount(async () => {
		const baseUrl = localStorage.getItem('baseUrl') || '';
		const apiKey = localStorage.getItem('apiKey') || '';

		if (!(baseUrl.length > 0 && apiKey.length > 0)) redirect(303, '/');

		const api = new JFApi(baseUrl, apiKey);

		libraries = await api.getLibraries();
	});
</script>

<h1>Libraries</h1>

{#if libraries}
	<Libraries {libraries}/>
{/if}

