<script lang="ts">
	import { onMount } from 'svelte';

    let baseUrl = "", apiKey = "", paramsSet = false;

	function setSecrets() {
		localStorage.setItem('baseUrl', baseUrl);
		localStorage.setItem('apiKey', apiKey);

        paramsSet = true;
	}

	onMount(() => {
        // Localstorage isnt available when rendering serverside so we have to get these here

		baseUrl = localStorage.getItem('baseUrl') || '';
		apiKey = localStorage.getItem('baseUrl') || '';

        paramsSet = baseUrl.length > 0 && apiKey.length > 0;
	});
</script>

<form on:submit|preventDefault={setSecrets}>
	<h2>Please enter the url and api key for your Jellyfin instance.</h2>
	<p>The url and api key stay in your browser and are never sent anywhere except to your server</p>

	<label for="url">Instance URL</label>
	<input type="url" name="url" id="url" bind:value={baseUrl} />

	<label for="apiKey">Api Key</label>
	<input type="password" name="apiKey" id="apiKey" bind:value={apiKey} />

	<button type="submit">Save</button>
</form>

{#if paramsSet}
	<a href="/generate">View Libraries</a>
{/if}
