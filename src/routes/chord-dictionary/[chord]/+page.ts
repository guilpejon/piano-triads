import { error, redirect } from '@sveltejs/kit';
import {
  chordFromSlug,
  chordSlug,
  chordDisplayName,
  getChord,
  getChordToneRule,
  getSluggedChords
} from '$lib/utils/chordUtils';
import type { EntryGenerator, PageLoad } from './$types';

// One prerendered page per chord. This route previously 302'd to
// /chord-dictionary?chord=X, which collapsed every chord into a single
// non-indexable URL.
export const prerender = true;

export const entries: EntryGenerator = () =>
  getSluggedChords().map(({ slug }) => ({ chord: slug }));

const SITE = 'https://www.pianotriads.com';

export const load: PageLoad = ({ params }) => {
  const name = chordFromSlug(params.chord);

  if (!name) {
    // Links from before the slug scheme used the raw chord name.
    const fromLegacyName = chordSlug(decodeURIComponent(params.chord));
    if (fromLegacyName) redirect(301, `/chord-dictionary/${fromLegacyName}`);
    error(404, `No chord named "${params.chord}"`);
  }

  const chord = getChord(name);
  if (!chord) error(404, `No chord named "${params.chord}"`);

  const display = chordDisplayName(name);
  const notes = chord.root_position.map((note) => note.replace(/\d+$/, ''));
  const canonical = `${SITE}/chord-dictionary/${params.chord}`;
  const description = `How to play the ${display} chord on piano: ${notes.join(
    ', '
  )}. See the notes on the staff and keyboard, plus every inversion.`;

  return {
    name,
    slug: params.chord,
    display,
    chord,
    toneRule: getChordToneRule(name.replace(/^[A-G][#b♭]?/, '')),
    seo: {
      title: `${display} Chord on Piano — Notes & Inversions | Piano Triads`,
      description,
      keywords: `${display} chord, ${name} piano chord, how to play ${display}, ${display} inversions, piano chords`,
      canonical,
      og: { title: `${display} Chord on Piano`, description, url: canonical },
      twitter: { title: `${display} Chord on Piano`, description },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to play the ${display} chord on piano`,
        description,
        url: canonical,
        step: chord.root_position.map((note, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: `Play ${note.replace(/\d+$/, '')}`,
          text: `Press ${note.replace(/\d+$/, '')} on the keyboard.`
        }))
      }
    }
  };
};
