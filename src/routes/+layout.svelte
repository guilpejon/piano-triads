<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<main class="flex-1 flex">
		{@render children?.()}
	</main>
	
	<footer class="bg-gray-800 text-white py-6">
		<div class="max-w-4xl mx-auto px-4 text-center">
			<p class="text-sm">
				Made with <span class="text-red-500">♥</span> by 
				<a 
					href="https://www.github.com/guilpejon" 
					target="_blank" 
					rel="noopener noreferrer"
					class="text-blue-400 hover:text-blue-300 transition-colors underline"
				>
					guilpejon
				</a>
			</p>
		</div>
	</footer>
</div>
