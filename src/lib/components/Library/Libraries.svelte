<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';
	import Library from './Library.svelte';
    
	let { libraries }: { libraries: JFLibrary[] } = $props();
</script>

<div class="libraries card">
	{#each libraries as library}
		<Library {library} />
	{/each}
</div>

<style>
	.libraries {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 15px;
		padding: 15px;
		justify-items: center;
	}
</style>
