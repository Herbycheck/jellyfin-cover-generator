<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';

	import { JFApi } from '$lib/jfApi';

	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import { WallCanvas } from '$lib/Canvas/WallCanvas';
	import type { WallCanvasOptions } from '$lib/types/WallCanvas';

	let library = $state<JFLibrary>();
	let libraryContent = $state<Array<any>>();

	let canvas: HTMLCanvasElement;
	let img: HTMLImageElement;
	let logOut: HTMLPreElement;
	let progress: HTMLDivElement;

	let renderer: WallCanvas | undefined;
	let rendererOptions: WallCanvasOptions | undefined = $state();

	onMount(async () => {
		const baseUrl = localStorage.getItem('baseUrl') || '';
		const apiKey = localStorage.getItem('apiKey') || '';

		if (!(baseUrl.length > 0 && apiKey.length > 0) || !page.params.id) redirect(303, '/');

		const api = new JFApi(baseUrl, apiKey);
		library = await api.getLibrary(page.params.id);
		libraryContent = await api.getLibraryItems(page.params.id);

		renderer = new WallCanvas(canvas, img, logOut, progress);
		renderer.options.title = library?.name;
		rendererOptions = renderer.options;

		renderer.setItems(libraryContent);
	});

	function updateOptions() {
		if (!renderer) return;

		renderer.options = rendererOptions!;
		renderer.setItems(libraryContent!);
	}
</script>

<div class="outputDisplay">
	<canvas id="canvas" bind:this={canvas}></canvas>
	<img id="image" bind:this={img} alt="" style="display: none;" />
</div>

<div class="progressDiv">
	<div class="progress" bind:this={progress}></div>
</div>

{#if rendererOptions}
	<div class="options">
		<label for="width">
			Poster Width
			<input name="width" type="number" bind:value={rendererOptions.posterWidth} />
		</label>

		<label for="padding">
			Space between posters
			<input name="padding" type="number" bind:value={rendererOptions.posterPadding} />
		</label>

		<label for="rows">
			Rows
			<input name="rows" type="number" bind:value={rendererOptions.rows} />
		</label>

		<label for="columns">
			Columns
			<input name="columns" type="number" bind:value={rendererOptions.columns} />
		</label>

		<label>
			Text
			<input type="text" bind:value={rendererOptions.title} />
		</label>

		<button onclick={updateOptions}>Update</button>
	</div>
{/if}

<button
	onclick={() => {
		renderer?.render();
	}}>Render</button
>

<pre bind:this={logOut} class="consoleOutput"></pre>

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

<style>
	.outputDisplay {
		width: fit-content;
		max-width: 80vw;
		background-color: gray;
		padding: 10px;
		margin-left: auto;
		margin-right: auto;
		margin-top: 10px;
		margin-bottom: 10px;
	}
	.outputDisplay > * {
		width: 100%;
	}

	.options {
		width: 600px;
		max-width: 90vw;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	label {
		display: flex;
		justify-content: space-between;
	}

	button {
		background-color: red;
		border: none;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		cursor: pointer;
	}

	.consoleOutput{
		font-family: monospace;
		background-color: rgb(42, 42, 42);
		overflow: scroll;
		width: 80%;
		height: 300px;
		padding: 10px;
	}

	.progressDiv {
		height: 30px;
		width: 100%;
	}
	.progress{
		height: 30px;
		width: 0%;
		background-color: green;
		transition: all 0.5s cubic-bezier(0.215, 0.610, 0.355, 1);
	}
</style>
