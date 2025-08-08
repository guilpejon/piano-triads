<script>
  import Piano from '$lib/components/Piano.svelte';
</script>

<div class="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <a href="/" class="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </a>
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Chord Dictionary</h1>
      <p class="text-xl text-gray-600">Explore and learn piano chord fingerings and progressions</p>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
      <Piano />
    </div>
  </div>
</div>