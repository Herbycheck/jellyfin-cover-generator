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

	function updateOptions(event: SubmitEvent) {
		event.preventDefault();
		if (!renderer) return;

		renderer.options = rendererOptions!;
		renderer.setItems(libraryContent!);
	}
</script>

<div class="card">
	<div class="outputDisplay">
		<canvas id="canvas" bind:this={canvas}></canvas>
		<img id="image" bind:this={img} alt="" style="display: none;" />
	</div>

	<div class="progressDiv">
		<div class="progress" bind:this={progress}></div>
	</div>
</div>
<div class="card">
	<h2>Options</h2>
	{#if rendererOptions}
		<form onsubmit={updateOptions} class="options">
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

			<button type="submit">Update</button>
		</form>
	{/if}
	<button class="primary"
		onclick={() => {
			renderer?.render();
		}}>Render</button
	>
</div>

<div class="card">
	<h2>Logs</h2>
	<pre bind:this={logOut} class="consoleOutput"></pre>
</div>

<style>
	.outputDisplay {
		display: flex;
		justify-content: center;
		margin-bottom: 30px;
	}
	.outputDisplay > * {
		max-height: 600px;
	}
	label {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.options {
		width: 100%;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 5px 15px;
	}

	.consoleOutput {
		font-family: monospace;
		background-color: rgb(42, 42, 42);
		overflow: scroll;
		width: 100%;
		height: 300px;
		padding: var(--padding-md);
		border-radius: var(--border-radius-md);
		margin: 0px;
	}

	.progressDiv {
		background-color: var(--background-color);
		height: 36px;
		width: 100%;
		margin-top: 5px;
		border-radius: var(--border-radius-md);
	}

	.progress {
		height: 36px;
		width: 0%;
		background-color: green;
		border-radius: var(--border-radius-md);
		transition: all 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
	}
</style>
