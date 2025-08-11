<svelte:head>
	<title>Pitch Training - Piano Triads</title>
	<meta name="description" content="Develop perfect pitch" />
</svelte:head>

<div class="w-full min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
    <div class="max-w-7xl mx-auto">
		<div class="mb-8">
			<a href="/" class="inline-flex items-center text-orange-600 hover:text-orange-800 mb-4">
				<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to Home
			</a>
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Pitch Training</h1>
    <p class="text-base sm:text-lg md:text-xl text-gray-600">Develop perfect pitch and interval recognition skills</p>
		</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-6">Training Modules</h2>
				
				<div class="space-y-4">
					<div class="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors">
						<div class="flex justify-between items-start mb-2">
							<h3 class="text-lg font-medium text-gray-800">Interval Recognition</h3>
							<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
						</div>
						<p class="text-gray-600 text-sm mb-3">Identify intervals between two notes</p>
						<div class="flex items-center justify-between">
							<div class="text-xs text-gray-500">
								<span>Accuracy: 78%</span> • <span>Best Streak: 12</span>
							</div>
                    <button class="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded transition-colors">
								Practice
							</button>
						</div>
					</div>

					<div class="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors">
						<div class="flex justify-between items-start mb-2">
							<h3 class="text-lg font-medium text-gray-800">Perfect Pitch Training</h3>
							<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Premium</span>
						</div>
						<p class="text-gray-600 text-sm mb-3">Identify individual notes without reference</p>
						<div class="flex items-center justify-between">
							<div class="text-xs text-gray-500">
								<span>Accuracy: 45%</span> • <span>Best Streak: 5</span>
							</div>
							<button class="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded transition-colors">
								Practice
							</button>
						</div>
					</div>

					<div class="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors">
						<div class="flex justify-between items-start mb-2">
							<h3 class="text-lg font-medium text-gray-800">Chord Quality Recognition</h3>
							<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">New</span>
						</div>
						<p class="text-gray-600 text-sm mb-3">Distinguish major, minor, and other chord types</p>
						<div class="flex items-center justify-between">
							<div class="text-xs text-gray-500">
								<span>Accuracy: 62%</span> • <span>Best Streak: 8</span>
							</div>
							<button class="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded transition-colors">
								Practice
							</button>
						</div>
					</div>

					<div class="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors">
						<div class="flex justify-between items-start mb-2">
							<h3 class="text-lg font-medium text-gray-800">Scale Degree Recognition</h3>
							<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Advanced</span>
						</div>
						<p class="text-gray-600 text-sm mb-3">Identify scale degrees in context</p>
						<div class="flex items-center justify-between">
							<div class="text-xs text-gray-500">
								<span>Locked</span> • <span>Complete intervals first</span>
							</div>
							<button class="bg-gray-300 text-gray-500 text-sm px-3 py-1 rounded cursor-not-allowed">
								Locked
							</button>
						</div>
					</div>
				</div>
			</div>

        <div class="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-6">Current Exercise</h2>
				
				<div class="text-center mb-6">
					<div class="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-800 mb-2">Interval Recognition</h3>
					<p class="text-gray-600">Listen and identify the interval</p>
				</div>

				<div class="bg-gray-50 rounded-lg p-6 mb-6">
					<div class="text-center mb-4">
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors text-base sm:text-lg font-medium">
							Play Interval
						</button>
					</div>
					<div class="text-center text-sm text-gray-600">
						<p>Question 7 of 10</p>
						<div class="w-full bg-gray-200 rounded-full h-2 mt-2">
							<div class="bg-orange-500 h-2 rounded-full" style="width: 70%"></div>
						</div>
					</div>
				</div>

                <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
					<button class="border border-gray-300 hover:border-orange-500 hover:bg-orange-50 py-3 px-4 rounded-lg transition-colors">
						Perfect 4th
					</button>
					<button class="border border-gray-300 hover:border-orange-500 hover:bg-orange-50 py-3 px-4 rounded-lg transition-colors">
						Perfect 5th
					</button>
					<button class="border border-gray-300 hover:border-orange-500 hover:bg-orange-50 py-3 px-4 rounded-lg transition-colors">
						Major 3rd
					</button>
					<button class="border border-gray-300 hover:border-orange-500 hover:bg-orange-50 py-3 px-4 rounded-lg transition-colors">
						Minor 3rd
					</button>
				</div>

				<div class="text-center">
					<div class="text-sm text-gray-600 mb-2">Current Streak: 4</div>
					<div class="flex justify-center space-x-1">
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<div class="w-2 h-2 bg-gray-300 rounded-full"></div>
					</div>
				</div>
			</div>
		</div>

        <div class="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8">
			<h2 class="text-2xl font-semibold text-gray-800 mb-6">Statistics & Progress</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="text-center p-6 bg-green-50 rounded-lg border border-green-200">
					<div class="text-3xl font-bold text-green-600 mb-2">156</div>
					<div class="text-sm text-green-700 font-medium">Exercises Completed</div>
					<div class="text-xs text-green-600 mt-1">This week: +23</div>
				</div>
				
				<div class="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
					<div class="text-3xl font-bold text-blue-600 mb-2">68%</div>
					<div class="text-sm text-blue-700 font-medium">Average Accuracy</div>
					<div class="text-xs text-blue-600 mt-1">Improving: +5%</div>
				</div>
				
				<div class="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
					<div class="text-3xl font-bold text-purple-600 mb-2">12</div>
					<div class="text-sm text-purple-700 font-medium">Best Streak</div>
					<div class="text-xs text-purple-600 mt-1">Personal record!</div>
				</div>
			</div>

			<div class="mt-8">
				<h3 class="text-lg font-medium text-gray-800 mb-4">Weekly Progress</h3>
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600">Monday</span>
						<div class="flex items-center">
                    <div class="w-24 sm:w-32 bg-gray-200 rounded-full h-2 mr-3">
								<div class="bg-orange-500 h-2 rounded-full" style="width: 80%"></div>
							</div>
							<span class="text-gray-700 font-medium">12 exercises</span>
						</div>
					</div>
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600">Tuesday</span>
						<div class="flex items-center">
							<div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
								<div class="bg-orange-500 h-2 rounded-full" style="width: 60%"></div>
							</div>
							<span class="text-gray-700 font-medium">9 exercises</span>
						</div>
					</div>
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-600">Today</span>
						<div class="flex items-center">
							<div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
								<div class="bg-orange-500 h-2 rounded-full" style="width: 40%"></div>
							</div>
							<span class="text-gray-700 font-medium">6 exercises</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
