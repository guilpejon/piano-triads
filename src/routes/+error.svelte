<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Determine if this is a 404 error
	$: is404 = $page.status === 404;
	$: errorCode = $page.status || 404;
	$: errorMessage = $page.error?.message || 'Page not found';

	// Piano keys animation state
	let animatedKeys = [0, 2, 4, 5, 7, 9, 11]; // C major scale
	let currentKeyIndex = 0;

	// Animate piano keys in sequence
	function startKeyAnimation() {
		setInterval(() => {
			currentKeyIndex = (currentKeyIndex + 1) % animatedKeys.length;
		}, 800);
	}

	// Start animation when component mounts
	import { onMount } from 'svelte';
	onMount(() => {
		startKeyAnimation();
	});

	// Navigation functions
	function goHome() {
		goto('/');
	}

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>{errorCode} - {is404 ? 'Page Not Found' : 'Error'} | Piano Triads</title>
	<meta name="description" content="Oops! The page you're looking for doesn't exist. Let's get you back on track with Piano Triads." />
</svelte:head>

<div class="error-wrapper">
	<div class="page-container">
		<div class="error-content">
			<!-- Piano Keys Animation -->
			<div class="piano-container">
				<div class="piano-keys">
					{#each Array(12) as _, i}
						<div 
							class="piano-key {i === 1 || i === 3 || i === 6 || i === 8 || i === 10 ? 'black' : 'white'}"
							class:active={animatedKeys[currentKeyIndex] === i}
						></div>
					{/each}
				</div>
			</div>

			<!-- Error Message -->
			<div class="error-message">
				<h1 class="error-code">{errorCode}</h1>
				<h2 class="error-title">
					{#if is404}
						Note Not Found
					{:else}
						Something Went Wrong
					{/if}
				</h2>
				<p class="error-description">
					{#if is404}
						The page you're looking for seems to have wandered off like a lost melody. 
						Let's get you back to the main composition!
					{:else}
						We hit a wrong note! Don't worry, even the best musicians make mistakes. 
						Let's try a different tune.
					{/if}
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="error-actions">
				<button on:click={goHome} class="glass-card action-button primary">
					<div class="button-icon">
						<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
					</div>
					Go Home
				</button>

				<button on:click={goBack} class="glass-card action-button secondary">
					<div class="button-icon">
						<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
						</svg>
					</div>
					Go Back
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.error-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 4rem);
		padding: 2rem 0;
		background: linear-gradient(135deg, rgba(0, 122, 255, 0.02) 0%, rgba(175, 82, 222, 0.02) 100%);
	}

	.error-content {
		text-align: center;
		max-width: 42rem;
		margin: 0 auto;
	}

	/* Piano Animation */
	.piano-container {
		margin-bottom: 3rem;
		display: flex;
		justify-content: center;
	}

	.piano-keys {
		display: flex;
		position: relative;
		border-radius: 0 0 8px 8px;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}

	.piano-key {
		transition: var(--transition-smooth);
		border-right: 1px solid #ddd;
	}

	.piano-key.white {
		width: 24px;
		height: 120px;
		background: linear-gradient(to bottom, #fefefe 0%, #f8f8f8 100%);
		border-bottom: 3px solid #ccc;
	}

	.piano-key.black {
		width: 16px;
		height: 80px;
		background: linear-gradient(to bottom, #333 0%, #000 100%);
		position: relative;
		margin-left: -8px;
		margin-right: -8px;
		z-index: 2;
		border-bottom: 2px solid #000;
	}

	.piano-key.active.white {
		background: linear-gradient(to bottom, var(--color-accent) 0%, #0056CC 100%);
		transform: translateY(2px);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.piano-key.active.black {
		background: linear-gradient(to bottom, var(--color-accent) 0%, #0056CC 100%);
		transform: translateY(2px);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Error Message */
	.error-message {
		margin-bottom: 3rem;
	}

	.error-code {
		font-size: clamp(4rem, 12vw, 8rem);
		font-weight: 700;
		margin: 0 0 1rem;
		background: var(--gradient-text);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
	}

	.error-title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		margin: 0 0 1.5rem;
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.error-description {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin: 0 0 2rem;
		max-width: 36rem;
		margin-left: auto;
		margin-right: auto;
	}

	/* Action Buttons */
	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 4rem;
		flex-wrap: wrap;
	}

	.action-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 1rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		transition: var(--transition-smooth);
		min-width: 140px;
		justify-content: center;
	}

	.action-button.primary {
		background: var(--gradient-blue);
		color: white;
		border: 1px solid transparent;
	}

	.action-button.primary:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.action-button.secondary {
		background: rgba(255, 255, 255, 0.95);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-light);
	}

	.action-button.secondary:hover {
		background: rgba(255, 255, 255, 1);
		border-color: var(--color-border-medium);
		transform: translateY(-2px);
	}

	.button-icon {
		display: flex;
		align-items: center;
	}

	/* Quick Navigation */
	.quick-nav {
		border-top: 1px solid var(--color-border-light);
		padding-top: 2rem;
	}

	.quick-nav-title {
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		margin: 0 0 1.5rem;
	}

	.quick-nav-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		max-width: 32rem;
		margin: 0 auto;
	}

	.quick-nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid var(--color-border-light);
		border-radius: 0.75rem;
		text-decoration: none;
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		transition: var(--transition-smooth);
	}

	.quick-nav-item:hover {
		background: rgba(255, 255, 255, 0.9);
		border-color: var(--color-border-medium);
		transform: translateY(-2px);
	}

	.nav-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: white;
	}

	.chord-icon {
		background: var(--gradient-blue);
	}

	.practice-icon {
		background: var(--gradient-green);
	}

	.scales-icon {
		background: var(--gradient-purple);
	}

	.pitch-icon {
		background: var(--gradient-orange);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.error-actions {
			flex-direction: column;
			align-items: center;
		}

		.action-button {
			width: 100%;
			max-width: 280px;
		}

		.quick-nav-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.piano-keys {
			transform: scale(0.8);
		}
	}

	@media (max-width: 480px) {
		.error-wrapper {
			padding: 1.5rem 0;
		}

		.error-description {
			font-size: 1rem;
		}

		.quick-nav-item {
			padding: 0.875rem;
			gap: 0.5rem;
		}

		.nav-icon {
			width: 2rem;
			height: 2rem;
		}

		.piano-keys {
			transform: scale(0.7);
		}
	}
</style>
