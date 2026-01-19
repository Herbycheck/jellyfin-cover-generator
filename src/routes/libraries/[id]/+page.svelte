<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';

	import { JFApi } from '$lib/jfApi';

	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import { WallCanvas } from '$lib/Canvas/WallCanvas';

	let library = $state<JFLibrary>();
	let libraryContent = $state<Array<any>>();

	let baseUrl = '';
	let canvas: HTMLCanvasElement;
	let renderer!: WallCanvas;

	onMount(async () => {
		baseUrl = localStorage.getItem('baseUrl') || '';
		const apiKey = localStorage.getItem('apiKey') || '';

		if (!(baseUrl.length > 0 && apiKey.length > 0) || !page.params.id) redirect(303, '/');

		const api = new JFApi(baseUrl, apiKey);
		library = await api.getLibrary(page.params.id);
		libraryContent = await api.getLibraryItems(page.params.id);

		renderer = new WallCanvas(canvas);

		renderer.loadImages(libraryContent);
	});

	const render = () => {
		console.log('Rendering');
		renderer.draw();
	};
</script>

<button onclick={render}> Render </button>

<canvas id="canvas" bind:this={canvas}></canvas>

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
