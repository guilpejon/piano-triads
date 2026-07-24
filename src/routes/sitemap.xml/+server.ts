import { getSluggedChords } from '$lib/utils/chordUtils';

// Built at prerender time, so the Pi serves it as a static file.
export const prerender = true;

const SITE = 'https://www.pianotriads.com';

// Hand-maintained because these are the app's fixed routes; the chord pages below are
// generated from the dictionary so new chords appear automatically.
const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/chord-dictionary', priority: '0.9', changefreq: 'weekly' },
  { path: '/chord-progressions', priority: '0.8', changefreq: 'monthly' },
  { path: '/learn-scales', priority: '0.8', changefreq: 'monthly' },
  { path: '/circle-of-fifths', priority: '0.8', changefreq: 'monthly' },
  { path: '/learn-music-reading', priority: '0.8', changefreq: 'monthly' },
  { path: '/chord-practice', priority: '0.7', changefreq: 'monthly' },
  { path: '/pitch-training', priority: '0.7', changefreq: 'monthly' },
  { path: '/music-score-practice', priority: '0.7', changefreq: 'monthly' }
];

export function GET() {
  const lastmod = new Date().toISOString().split('T')[0];

  const urls = [
    ...STATIC_ROUTES.map(
      ({ path, priority, changefreq }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    ),
    ...getSluggedChords().map(
      ({ slug }) => `  <url>
    <loc>${SITE}/chord-dictionary/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
}
