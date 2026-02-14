<script lang="ts">
	import type { JFLibrary } from '$lib/types/jellyfin';
	let { library }: { library: JFLibrary } = $props();
</script>

<a href={`/libraries/${library.id}`}>
	<div class="card library">
		<img src={library.imageUrl} alt="Library" />

		<h2>{library.name}</h2>
	</div>
</a>

<style>
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
