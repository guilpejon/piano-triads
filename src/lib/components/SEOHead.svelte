<script lang="ts">
  import { page } from '$app/stores';
  import { mergeSEO, pageSEOConfigs, SHARED_OG_META, SHARED_TWITTER_META, type SEOData } from '$lib/utils/seoUtils';
  
  // Get the current route for dynamic SEO
  $: currentRoute = $page.route.id?.replace(/^\//, '') || '';  // Remove leading slash
  $: pageConfig = pageSEOConfigs[currentRoute] || {};
  $: seoData = mergeSEO(pageConfig);
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{seoData.title}</title>
  <meta name="description" content={seoData.description} />
  {#if seoData.keywords}
    <meta name="keywords" content={seoData.keywords} />
  {/if}
  <meta name="author" content="Piano Triads" />
  <meta name="robots" content="index, follow" />
  {#if seoData.canonical}
    <link rel="canonical" href={seoData.canonical} />
  {/if}

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content={seoData.og?.title || seoData.title} />
  <meta property="og:description" content={seoData.og?.description || seoData.description} />
  <meta property="og:type" content={seoData.og?.type || 'website'} />
  <meta property="og:url" content={seoData.og?.url || seoData.canonical} />
  <meta property="og:image" content={seoData.og?.image || SHARED_OG_META.image.url} />
  <meta property="og:image:secure_url" content={seoData.og?.image || SHARED_OG_META.image.url} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content={SHARED_OG_META.image.width} />
  <meta property="og:image:height" content={SHARED_OG_META.image.height} />
  <meta property="og:image:alt" content={seoData.og?.imageAlt || 'Piano Triads - Interactive Piano Learning Platform'} />
  <meta property="og:site_name" content={SHARED_OG_META.site_name} />
  <meta property="og:locale" content={SHARED_OG_META.locale} />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content={SHARED_TWITTER_META.card} />
  <meta name="twitter:title" content={seoData.twitter?.title || seoData.og?.title || seoData.title} />
  <meta name="twitter:description" content={seoData.twitter?.description || seoData.og?.description || seoData.description} />
  <meta name="twitter:image" content={seoData.twitter?.image || seoData.og?.image || SHARED_OG_META.image.url} />
  <meta name="twitter:image:alt" content={seoData.twitter?.imageAlt || seoData.og?.imageAlt} />
  <meta name="twitter:creator" content={SHARED_TWITTER_META.creator} />

  <!-- Additional SEO Meta Tags -->
  <meta name="application-name" content="Piano Triads" />
  <meta name="generator" content="SvelteKit" />
  <meta name="rating" content="general" />
  <meta name="distribution" content="global" />
  <meta name="language" content="EN" />

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#3480f1" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Piano Triads" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="msapplication-TileColor" content="#3480f1" />
  <meta name="msapplication-tap-highlight" content="no" />

  <!-- Web App Manifest -->
  <link rel="manifest" href="/manifest.json" />

  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />

  <!-- Microsoft Tiles -->
  <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

  <!-- Viewport for mobile optimization -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

  <!-- Structured Data (JSON-LD) -->
  {#if seoData.structuredData}
    <script type="application/ld+json">
      {@html JSON.stringify(seoData.structuredData, null, 2)}
    </script>
  {/if}
</svelte:head>
