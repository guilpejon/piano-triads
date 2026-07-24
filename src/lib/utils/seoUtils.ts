export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  og?: {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    image?: string;
    imageAlt?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
  };
  structuredData?: Record<string, any>;
}

// Shared/default SEO configuration
export const defaultSEO: SEOData = {
  title: "Piano Triads - Master Piano Chords, Scales & Ear Training",
  description: "Master piano chords and scales with interactive lessons, practice modes, and ear training exercises. Learn chord progressions, scales, and develop perfect pitch with our comprehensive piano learning platform.",
  keywords: "piano, chords, scales, music theory, ear training, chord progressions, circle of fifths, piano practice, music education, interactive piano lessons",
  canonical: "https://www.pianotriads.com",
  og: {
    title: "Piano Triads - Master Piano Chords, Scales & Ear Training",
    description: "Master piano chords and scales with interactive lessons, practice modes, and ear training exercises. Learn chord progressions, scales, and develop perfect pitch with our comprehensive piano learning platform.",
    url: "https://www.pianotriads.com",
    type: "website",
    image: "https://www.pianotriads.com/og-images/piano-triads-main.jpg",
    imageAlt: "Piano Triads - Interactive Piano Learning Platform with Chord Dictionary, Scale Practice, and Ear Training"
  },
  twitter: {
    title: "Piano Triads - Master Piano Chords, Scales & Ear Training",
    description: "Master piano chords and scales with interactive lessons, practice modes, and ear training exercises.",
    image: "https://www.pianotriads.com/og-images/piano-triads-main.jpg",
    imageAlt: "Piano Triads - Interactive Piano Learning Platform"
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Piano Triads",
    "url": "https://www.pianotriads.com",
    "description": "Master piano chords and scales with interactive lessons, practice modes, and ear training exercises. Learn chord progressions, scales, and develop perfect pitch with our comprehensive piano learning platform.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Organization",
      "name": "Piano Triads",
      "url": "https://www.pianotriads.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Interactive Chord Dictionary",
      "Chord Practice Games",
      "Scale Learning",
      "Pitch Training",
      "Chord Progressions",
      "Circle of Fifths",
      "Progress Tracking"
    ]
  }
};

// Shared constants for consistent metadata
export const SHARED_OG_META = {
  site_name: "Piano Triads",
  locale: "en_US",
  image: {
    url: "https://www.pianotriads.com/og-images/piano-triads-main.jpg",
    width: "1200",
    height: "630"
  }
};

export const SHARED_TWITTER_META = {
  card: "summary_large_image",
  creator: "@piano_triads"
};

// Merge page-specific SEO with defaults
export function mergeSEO(pageSEO: Partial<SEOData>): SEOData {
  return {
    ...defaultSEO,
    ...pageSEO,
    og: {
      ...defaultSEO.og,
      ...pageSEO.og
    },
    twitter: {
      ...defaultSEO.twitter,
      ...pageSEO.twitter
    },
    structuredData: pageSEO.structuredData || defaultSEO.structuredData
  };
}

// Page-specific SEO configurations
export const pageSEOConfigs: Record<string, Partial<SEOData>> = {
  // Homepage (empty string for root route)
  '': {
    // Use default SEO for homepage (no overrides needed)
  },
  'chord-dictionary': {
    title: "Chord Dictionary - Interactive Piano Chord Reference | Piano Triads",
    description: "Explore and learn piano chords with our interactive chord dictionary. See chord inversions, hear audio playback, and master major, minor, diminished, suspended, and extended chords.",
    keywords: "piano chords, chord dictionary, chord inversions, major chords, minor chords, diminished chords, suspended chords, seventh chords, chord reference",
    canonical: "https://www.pianotriads.com/chord-dictionary",
    og: {
      title: "Chord Dictionary - Interactive Piano Chord Reference | Piano Triads",
      description: "Explore and learn piano chords with our interactive chord dictionary. See chord inversions, hear audio playback, and master major, minor, diminished, suspended, and extended chords.",
      url: "https://www.pianotriads.com/chord-dictionary",
      imageAlt: "Piano Chord Dictionary - Interactive chord learning with piano keyboard and musical notation"
    },
    twitter: {
      title: "Chord Dictionary - Interactive Piano Chord Reference | Piano Triads",
      description: "Explore and learn piano chords with our interactive chord dictionary. See chord inversions, hear audio playback, and master all chord types.",
      imageAlt: "Piano Chord Dictionary - Interactive chord learning tool"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Chord Dictionary - Interactive Piano Chord Reference",
      "url": "https://www.pianotriads.com/chord-dictionary",
      "description": "Explore and learn piano chords with our interactive chord dictionary. See chord inversions, hear audio playback, and master major, minor, diminished, suspended, and extended chords.",
      "mainEntity": {
        "@type": "LearningResource",
        "name": "Piano Chord Dictionary",
        "description": "Interactive chord dictionary featuring major, minor, diminished, suspended, and extended chords with audio playback and multiple inversions.",
        "educationalLevel": "Beginner to Advanced",
        "learningResourceType": "Reference Tool",
        "teaches": [
          "Piano Chord Theory",
          "Chord Inversions",
          "Chord Construction",
          "Music Theory Fundamentals"
        ],
        "interactivityType": "Active"
      }
    }
  },
  
  'chord-practice': {
    title: "Chord Practice - Interactive Piano Chord Training Game | Piano Triads",
    description: "Master chord recognition with our interactive piano chord practice game. Build chords note by note, track your progress, and improve your music theory skills with timed challenges.",
    keywords: "chord practice, piano training, chord recognition, music theory practice, piano games, chord building, ear training, music education",
    canonical: "https://www.pianotriads.com/chord-practice",
    og: {
      title: "Chord Practice - Interactive Piano Chord Training Game | Piano Triads",
      description: "Master chord recognition with our interactive piano chord practice game. Build chords note by note, track your progress, and improve your music theory skills with timed challenges.",
      url: "https://www.pianotriads.com/chord-practice",
      imageAlt: "Piano Chord Practice Game - Interactive chord building challenge with timer and progress tracking"
    },
    twitter: {
      title: "Chord Practice - Interactive Piano Chord Training Game | Piano Triads",
      description: "Master chord recognition with our interactive piano chord practice game. Build chords note by note and track your progress.",
      imageAlt: "Piano Chord Practice Game - Interactive training"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Chord Practice - Interactive Piano Chord Training Game",
      "url": "https://www.pianotriads.com/chord-practice",
      "description": "Master chord recognition with our interactive piano chord practice game. Build chords note by note, track your progress, and improve your music theory skills with timed challenges.",
      "mainEntity": {
        "@type": "Game",
        "name": "Piano Chord Practice Game",
        "description": "Interactive chord recognition game where players identify and build piano chords within time limits.",
        "genre": "Educational Game",
        "gameItem": {
          "@type": "Thing",
          "name": "Piano Chord Training"
        },
        "teaches": [
          "Chord Recognition",
          "Piano Technique",
          "Music Theory",
          "Ear Training"
        ]
      }
    }
  },

  'circle-of-fifths': {
    title: "Circle of Fifths - Interactive Key Signature & Music Theory Tool | Piano Triads",
    description: "Master the Circle of Fifths with our interactive visual tool. Learn key signatures, chord relationships, and music theory fundamentals through an engaging, clickable interface.",
    keywords: "circle of fifths, key signatures, music theory, chord relationships, major keys, minor keys, sharps and flats, music theory tool",
    canonical: "https://www.pianotriads.com/circle-of-fifths",
    og: {
      title: "Circle of Fifths - Interactive Key Signature & Music Theory Tool | Piano Triads",
      description: "Master the Circle of Fifths with our interactive visual tool. Learn key signatures, chord relationships, and music theory fundamentals through an engaging, clickable interface.",
      url: "https://www.pianotriads.com/circle-of-fifths",
      imageAlt: "Interactive Circle of Fifths - Key signatures, major and minor keys visualization tool"
    },
    twitter: {
      title: "Circle of Fifths - Interactive Key Signature & Music Theory Tool | Piano Triads",
      description: "Master the Circle of Fifths with our interactive visual tool. Learn key signatures and music theory fundamentals.",
      imageAlt: "Interactive Circle of Fifths Tool"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Circle of Fifths - Interactive Key Signature & Music Theory Tool",
      "url": "https://www.pianotriads.com/circle-of-fifths",
      "description": "Master the Circle of Fifths with our interactive visual tool. Learn key signatures, chord relationships, and music theory fundamentals through an engaging, clickable interface.",
      "mainEntity": {
        "@type": "LearningResource",
        "name": "Interactive Circle of Fifths Tool",
        "description": "Visual, interactive representation of the Circle of Fifths for learning key signatures, chord relationships, and fundamental music theory concepts.",
        "educationalLevel": "Beginner to Advanced",
        "learningResourceType": "Interactive Diagram",
        "teaches": [
          "Key Signatures",
          "Circle of Fifths",
          "Major and Minor Keys",
          "Sharps and Flats",
          "Chord Relationships",
          "Music Theory Fundamentals"
        ],
        "interactivityType": "Active"
      }
    }
  },

  'chord-progressions': {
    title: "Chord Progressions - Learn Popular Piano Chord Progressions | Piano Triads",
    description: "Master common chord progressions used in popular music. Learn I-V-vi-IV, ii-V-I, and other essential progressions with interactive examples and practice exercises.",
    keywords: "chord progressions, piano progressions, I-V-vi-IV, ii-V-I, popular music chords, song progressions, music theory, chord sequences",
    canonical: "https://www.pianotriads.com/chord-progressions",
    og: {
      title: "Chord Progressions - Learn Popular Piano Chord Progressions | Piano Triads",
      description: "Master common chord progressions used in popular music. Learn I-V-vi-IV, ii-V-I, and other essential progressions with interactive examples and practice exercises.",
      url: "https://www.pianotriads.com/chord-progressions",
      imageAlt: "Piano Chord Progressions - Learn I-V-vi-IV, ii-V-I and popular music progressions"
    },
    twitter: {
      title: "Chord Progressions - Learn Popular Piano Chord Progressions | Piano Triads",
      description: "Master common chord progressions used in popular music with interactive examples and practice exercises.",
      imageAlt: "Piano Chord Progressions Learning Tool"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Chord Progressions - Learn Popular Piano Chord Progressions",
      "url": "https://www.pianotriads.com/chord-progressions",
      "description": "Master common chord progressions used in popular music. Learn I-V-vi-IV, ii-V-I, and other essential progressions with interactive examples and practice exercises.",
      "mainEntity": {
        "@type": "LearningResource",
        "name": "Piano Chord Progressions Guide",
        "description": "Interactive guide to learning popular chord progressions including I-V-vi-IV, ii-V-I, and other essential sequences used in contemporary music.",
        "educationalLevel": "Beginner to Intermediate",
        "learningResourceType": "Interactive Guide",
        "teaches": [
          "Chord Progressions",
          "Roman Numeral Analysis",
          "Popular Music Theory",
          "Song Structure",
          "Harmonic Analysis"
        ],
        "interactivityType": "Active"
      }
    }
  },

  'learn-scales': {
    title: "Learn Piano Scales - Major, Minor, Pentatonic & Modal Scales | Piano Triads",
    description: "Master piano scales with our interactive scale learning tool. Explore major, minor, pentatonic, blues, and modal scales with audio playback, scale degrees, and comprehensive theory.",
    keywords: "piano scales, major scales, minor scales, pentatonic scales, blues scale, modal scales, scale theory, music theory, piano lessons",
    canonical: "https://www.pianotriads.com/learn-scales",
    og: {
      title: "Learn Piano Scales - Major, Minor, Pentatonic & Modal Scales | Piano Triads",
      description: "Master piano scales with our interactive scale learning tool. Explore major, minor, pentatonic, blues, and modal scales with audio playback, scale degrees, and comprehensive theory.",
      url: "https://www.pianotriads.com/learn-scales",
      imageAlt: "Piano Scales Learning - Interactive scale practice with major, minor, pentatonic, and modal scales"
    },
    twitter: {
      title: "Learn Piano Scales - Major, Minor, Pentatonic & Modal Scales | Piano Triads",
      description: "Master piano scales with our interactive scale learning tool. Explore all major scale types with audio playback and theory.",
      imageAlt: "Piano Scales Learning Tool - Interactive scale practice"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Learn Piano Scales - Major, Minor, Pentatonic & Modal Scales",
      "url": "https://www.pianotriads.com/learn-scales",
      "description": "Master piano scales with our interactive scale learning tool. Explore major, minor, pentatonic, blues, and modal scales with audio playback, scale degrees, and comprehensive theory.",
      "mainEntity": {
        "@type": "LearningResource",
        "name": "Piano Scale Learning Tool",
        "description": "Comprehensive scale learning resource featuring major, minor, pentatonic, blues, and all modal scales with interactive piano visualization and audio playback.",
        "educationalLevel": "Beginner to Advanced",
        "learningResourceType": "Interactive Tool",
        "teaches": [
          "Major Scales",
          "Minor Scales",
          "Pentatonic Scales",
          "Blues Scales",
          "Modal Scales",
          "Scale Theory",
          "Scale Degrees"
        ],
        "interactivityType": "Active"
      }
    }
  },

  'pitch-training': {
    title: "Pitch Training - Perfect Pitch & Ear Training Exercises | Piano Triads",
    description: "Develop perfect pitch and interval recognition skills with our interactive ear training exercises. Practice note identification and chord recognition to improve your musical ear.",
    keywords: "pitch training, ear training, perfect pitch, interval recognition, note identification, chord recognition, ear training exercises, music theory practice",
    canonical: "https://www.pianotriads.com/pitch-training",
    og: {
      title: "Pitch Training - Perfect Pitch & Ear Training Exercises | Piano Triads",
      description: "Develop perfect pitch and interval recognition skills with our interactive ear training exercises. Practice note identification and chord recognition to improve your musical ear.",
      url: "https://www.pianotriads.com/pitch-training",
      imageAlt: "Pitch Training & Ear Training - Perfect pitch development with note and chord recognition exercises"
    },
    twitter: {
      title: "Pitch Training - Perfect Pitch & Ear Training Exercises | Piano Triads",
      description: "Develop perfect pitch and interval recognition skills with our interactive ear training exercises.",
      imageAlt: "Pitch Training & Ear Training Exercises"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Pitch Training - Perfect Pitch & Ear Training Exercises",
      "url": "https://www.pianotriads.com/pitch-training",
      "description": "Develop perfect pitch and interval recognition skills with our interactive ear training exercises. Practice note identification and chord recognition to improve your musical ear.",
      "mainEntity": {
        "@type": "LearningResource",
        "name": "Piano Pitch Training Tool",
        "description": "Interactive ear training exercises for developing perfect pitch, note identification, and chord recognition skills.",
        "educationalLevel": "Beginner to Advanced",
        "learningResourceType": "Practice Tool",
        "teaches": [
          "Perfect Pitch",
          "Note Identification",
          "Chord Recognition",
          "Interval Recognition",
          "Ear Training"
        ],
        "interactivityType": "Active"
      }
    }
  },

  'progress': {
    title: "Progress Dashboard - Track Your Piano Learning Journey | Piano Triads",
    description: "Monitor your piano learning progress with detailed statistics, achievements, and performance tracking across chords, scales, and ear training exercises.",
    keywords: "piano progress tracking, learning statistics, music achievements, practice progress, piano learning dashboard, performance analytics",
    canonical: "https://www.pianotriads.com/progress",
    og: {
      title: "Progress Dashboard - Track Your Piano Learning Journey | Piano Triads",
      description: "Monitor your piano learning progress with detailed statistics, achievements, and performance tracking across chords, scales, and ear training exercises.",
      url: "https://www.pianotriads.com/progress",
      imageAlt: "Piano Learning Progress Dashboard - Statistics, achievements, and performance tracking"
    },
    twitter: {
      title: "Progress Dashboard - Track Your Piano Learning Journey | Piano Triads",
      description: "Monitor your piano learning progress with detailed statistics and achievements.",
      imageAlt: "Piano Learning Progress Dashboard"
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Progress Dashboard - Track Your Piano Learning Journey",
      "url": "https://www.pianotriads.com/progress",
      "description": "Monitor your piano learning progress with detailed statistics, achievements, and performance tracking across chords, scales, and ear training exercises.",
      "mainEntity": {
        "@type": "WebApplication",
        "name": "Piano Learning Progress Tracker",
        "description": "Comprehensive progress tracking system for monitoring piano learning achievements, practice statistics, and skill development across multiple learning modules.",
        "applicationCategory": "EducationalApplication",
        "featureList": [
          "Practice Statistics",
          "Achievement Tracking",
          "Performance Analytics",
          "Learning Progress Visualization",
          "Skill Assessment"
        ]
      }
    }
  }
};
