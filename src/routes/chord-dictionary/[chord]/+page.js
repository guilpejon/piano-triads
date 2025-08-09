import { redirect } from '@sveltejs/kit';

export function load({ params, url }) {
  // Redirect to main chord-dictionary page with the chord info preserved in URL
  const chord = params.chord;
  const inversion = url.searchParams.get('inversion');
  
  // Build the redirect URL with query parameters instead
  const searchParams = new URLSearchParams();
  searchParams.set('chord', chord);
  if (inversion) {
    searchParams.set('inversion', inversion);
  }
  
  throw redirect(302, `/chord-dictionary?${searchParams.toString()}`);
}
