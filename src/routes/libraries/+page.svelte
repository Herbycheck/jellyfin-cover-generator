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

<h1>Libraries</h1>
<div class="libraries">
	{#each libraries as library}
		<a href={`/libraries/${library.id}`}>
			<div class="card library">
				<img src={library.imageUrl} alt="Library" />

				<h2>{library.name}</h2>
			</div>
		</a>
	{/each}
</div>

<style>
	img {
		width: 100%;
	}

	.libraries {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 15px;
		padding: 15px;
		width: 80vw;
		justify-items: center;
	}

	.library {
		display: flex;
		width: 500px;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	h2 {
		margin: 0px;
	}
</style>
