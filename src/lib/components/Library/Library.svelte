<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';
	let { library }: { library: JFLibrary } = $props();
</script>

<a href={`/libraries/${library.id}`} class="library">
	<img src={library.imageUrl} alt="Library" />

	<h2 class="m-0">{library.name}</h2>
</a>

<style>
	.library {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		background-color: var(--background-color);

		border-radius: var(--border-radius-md);
		padding: var(--padding-md);
	}

	img {
		flex-grow: 1;
		min-width: 0px;
		aspect-ratio: initial;
		object-fit: contain;
		
	}
</style>
