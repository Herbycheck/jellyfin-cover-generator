<script lang="ts">
	import Libraries from '$lib/components/Library/Libraries.svelte';
	import { JFApi } from '$lib/jfApi';
	import type { JFLibrary } from '$lib/types/jellyfin';
	import { onMount } from 'svelte';

	let libraries = $state<Array<JFLibrary>>();

	let baseUrl = $state(''),
		apiKey = $state(''),
		paramsSet = $state(false);

	function setSecrets() {
		localStorage.setItem('baseUrl', baseUrl);
		localStorage.setItem('apiKey', apiKey);

		paramsSet = true;

		updateLibraries();
	}

	async function updateLibraries() {
		if (baseUrl.length == 0 || apiKey.length == 0) return;

		const api = new JFApi(baseUrl, apiKey);

		libraries = await api.getLibraries();
	}

	onMount(() => {
		// Localstorage isnt available when rendering serverside so we have to get these here

		baseUrl = localStorage.getItem('baseUrl') || '';
		apiKey = localStorage.getItem('apiKey') || '';

		paramsSet = baseUrl.length > 0 && apiKey.length > 0;

		updateLibraries();
	});
</script>

<form on:submit|preventDefault={setSecrets} class="card">
	<h2 class="text-center">Please enter the url and api key for your Jellyfin instance.</h2>
	<label for="url">Instance URL</label>
	<input type="url" name="url" id="url" bind:value={baseUrl} />

	<label for="apiKey">Api Key</label>
	<input type="password" name="apiKey" id="apiKey" bind:value={apiKey} />

	<button type="submit">Get Libraries</button>

	<p class="m-0 weak text-center">
		The url and api key stay in your browser and are never sent anywhere except to your server
	</p>
</form>

{#if paramsSet}
	{#if libraries}
		<Libraries {libraries} />
	{:else}
		<p>Loading...</p>
	{/if}
{/if}

<div class="card">
	<p class="m-0 text-center">
		This is an open-source project, you can view the source code on <a
			href="https://github.com/Herbycheck/jellyfin-cover-generator">Github</a
		>
	</p>
</div>
