// Audio utility functions for piano playback

// Function to convert note data to MP3 filename
function getNoteFileName(noteData: string): string {
	// Extract the first note from compound notes like "C#3/Db3"
	let primaryNote = noteData.split('/')[0];
	
	// Convert flat notes to their sharp equivalents to match MP3 filenames
	const flatToSharpMap: { [key: string]: string } = {
		'Db': 'C#',
		'Eb': 'D#',
		'Gb': 'F#',
		'Ab': 'G#',
		'Bb': 'A#'
	};
	
	// Check if the note contains a flat and convert it
	for (const [flat, sharp] of Object.entries(flatToSharpMap)) {
		if (primaryNote.includes(flat)) {
			primaryNote = primaryNote.replace(flat, sharp);
			break;
		}
	}
	
	// Convert sharp (#) to 's' for filename (C#3 -> Cs3) and make lowercase
	return primaryNote.replace('#', 's').toLowerCase();
}

// Function to play audio for a given note
export function playNote(noteData: string): void {
	try {
		const fileName = getNoteFileName(noteData);
		const audio = new Audio(`/audio/piano/${fileName}.mp3`);
		
		// Reset audio to beginning if it's already playing
		audio.currentTime = 0;
		
		// Play the audio
		audio.play().catch(error => {
			console.warn(`Could not play audio for ${fileName}:`, error);
		});
	} catch (error) {
		console.error(`Error playing note ${noteData}:`, error);
	}
}

// Function to play multiple notes as a chord
export function playChord(notes: string[]): void {
	// Play all notes simultaneously with slight delay to create chord effect
	notes.forEach((note, index) => {
		setTimeout(() => {
			playNote(note);
		}, index * 50); // 50ms delay between each note for better chord sound
	});
}
