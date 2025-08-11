<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
	<title>Piano Triads - Master Piano Chords, Scales & Ear Training</title>
	<meta name="description" content="Master piano chords and scales" />
</svelte:head>

<div class="app-layout">
	<Navbar />
	
	<main class="main-content">
		<slot />
	</main>
	
	<footer class="app-footer">
		<div class="footer-container">
			<p class="footer-text">
				Made with <span class="heart">♥</span> by 
				<a 
					href="https://www.github.com/guilpejon" 
					target="_blank" 
					rel="noopener noreferrer"
					class="footer-link"
				>
					guilpejon
				</a>
			</p>
		</div>
	</footer>
</div>

<style>
	.app-layout {
		min-height: 100vh;
		background: var(--color-background);
		display: flex;
		flex-direction: column;
	}

	.main-content {
		flex: 1;
		padding-top: 4rem; /* Account for fixed navbar height */
	}

	.app-footer {
		background: #1f2937;
		color: white;
		padding: 1.5rem 0;
		margin-top: auto;
	}

	.footer-container {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.5rem;
		text-align: center;
	}

	.footer-text {
		font-size: 0.875rem;
		margin: 0;
	}

	.heart {
		color: #ef4444;
	}

	.footer-link {
		color: var(--color-accent);
		text-decoration: underline;
		transition: var(--transition-smooth);
	}

	.footer-link:hover {
		color: var(--color-accent-hover);
	}

	@media (max-width: 768px) {
		.footer-container {
			padding: 0 1.25rem;
		}
	}

	@media (max-width: 480px) {
		.footer-container {
			padding: 0 1rem;
		}
	}
</style>