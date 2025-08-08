<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen flex flex-col">
    <main class="flex-1 flex justify-center items-center">
        <slot />
    </main>
	
    <footer class="bg-gray-800 text-white py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
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
