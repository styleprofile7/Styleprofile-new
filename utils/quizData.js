export const quizQuestions = [
  {
    category: "Silhouette Preference",
    question: "When choosing an outfit, which shape feels most natural to you?",
    sub: "Go with your gut — the silhouette you reach for without thinking.",
    layout: "cols-2",
    options: [
      { label: "Fitted & structured", desc: "Clean lines, tailored to the body", scores: { executive: 3, '1percenter': 2, '9to5er': 1 } },
      { label: "Oversized & relaxed", desc: "Volume, ease, breathing room", scores: { 'hoods-finest': 3, creative: 2, alt: 1 } },
      { label: "Layered & complex", desc: "Multiple pieces, built outward", scores: { creative: 3, alt: 2, influencer: 1 } },
      { label: "Balanced & proportional", desc: "Neither extreme — everything in harmony", scores: { 'rich-housewife': 3, '1percenter': 2, influencer: 1 } }
    ]
  },
  {
    category: "Color & Palette Identity",
    question: "Which color palette best reflects your wardrobe right now?",
    sub: "Not what you wish it looked like — what it actually looks like.",
    layout: "cols-2",
    options: [
      { label: "Neutrals & earth tones", desc: "Beige, ivory, camel, white, brown", scores: { 'rich-housewife': 3, '1percenter': 2, '9to5er': 1 } },
      { label: "All black, all the time", desc: "Monochrome is a lifestyle", scores: { alt: 3, executive: 2, creative: 1 } },
      { label: "Bold & unexpected color", desc: "Statement pieces, vibrant combinations", scores: { 'hoods-finest': 3, influencer: 2, creative: 1 } },
      { label: "Curated mixed palette", desc: "Intentional contrast, considered tones", scores: { creative: 3, '1percenter': 2, influencer: 1 } }
    ]
  },
  {
    category: "Texture & Material Sensibility",
    question: "Which materials do you naturally gravitate toward when shopping?",
    sub: "The fabrics your hands reach for first.",
    layout: "cols-2",
    options: [
      { label: "Luxury natural fibers", desc: "Cashmere, silk, fine wool, leather", scores: { '1percenter': 3, 'rich-housewife': 2, executive: 1 } },
      { label: "Technical & performance", desc: "Nylon, Gore-Tex, utility fabrics", scores: { 'hoods-finest': 3, alt: 2, '9to5er': 1 } },
      { label: "Vintage & worn textures", desc: "Denim, distressed cotton, thrifted feel", scores: { alt: 3, creative: 2, 'hoods-finest': 1 } },
      { label: "Clean & minimal fabrics", desc: "Crisp cotton, structured poplin", scores: { executive: 3, '9to5er': 2, '1percenter': 1 } }
    ]
  },
  {
    category: "Cultural Style Signals",
    question: "Which cultural scene influences your style the most?",
    sub: "Where does your aesthetic come from?",
    layout: "cols-2",
    options: [
      { label: "Luxury & high fashion", desc: "Runways, heritage houses, investment pieces", scores: { '1percenter': 3, 'rich-housewife': 2, executive: 1 } },
      { label: "Streetwear & sneaker culture", desc: "Drops, collabs, cultural currency", scores: { 'hoods-finest': 3, influencer: 2, creative: 1 } },
      { label: "Avant-garde & art world", desc: "Experimental, conceptual, boundary-pushing", scores: { alt: 3, creative: 3, influencer: 1 } },
      { label: "Social media & digital culture", desc: "Trending aesthetics, viral looks", scores: { influencer: 3, '9to5er': 1, 'hoods-finest': 1 } }
    ]
  },
  {
    category: "Era & Inspiration",
    question: "Which fashion era inspires your style the most?",
    sub: "The decade or movement you keep coming back to.",
    layout: "cols-2",
    options: [
      { label: "Timeless classics", desc: "No specific era — just enduring quality", scores: { '1percenter': 3, executive: 2, 'rich-housewife': 1 } },
      { label: "90s & early 2000s", desc: "Streetwear golden age, cultural peak", scores: { 'hoods-finest': 3, influencer: 2, creative: 1 } },
      { label: "70s & 80s", desc: "Bold, expressive, culturally charged", scores: { creative: 3, alt: 2, 'rich-housewife': 1 } },
      { label: "Current & emerging", desc: "What's happening right now", scores: { influencer: 3, '9to5er': 2, 'hoods-finest': 1 } }
    ]
  },
  {
    category: "Risk vs. Reliability",
    question: "How do you approach getting dressed when you want to make an impression?",
    sub: "Your instinct when the stakes feel higher than usual.",
    layout: "cols-2",
    options: [
      { label: "I wear something proven", desc: "A look I know works, executed perfectly", scores: { executive: 3, '1percenter': 2, '9to5er': 2 } },
      { label: "I push my boundaries", desc: "Something new, bold, slightly risky", scores: { creative: 3, alt: 2, influencer: 2 } },
      { label: "I lead with a statement piece", desc: "One powerful item does the work", scores: { 'hoods-finest': 3, 'rich-housewife': 2, influencer: 1 } },
      { label: "I dress for the room", desc: "I read the context and elevate it", scores: { '1percenter': 2, executive: 2, '9to5er': 2 } }
    ]
  },
  {
    category: "Outfit Construction",
    question: "How do you typically build an outfit from scratch?",
    sub: "Your natural process when putting a look together.",
    layout: "cols-2",
    options: [
      { label: "Start with one key piece", desc: "Everything else supports a single hero item", scores: { 'hoods-finest': 3, 'rich-housewife': 2, '1percenter': 1 } },
      { label: "Build through layering", desc: "Multiple pieces, depth and dimension", scores: { creative: 3, alt: 2, influencer: 1 } },
      { label: "Assemble a complete uniform", desc: "A cohesive system, everything considered", scores: { executive: 3, '1percenter': 2, '9to5er': 1 } },
      { label: "Follow what feels right", desc: "Intuitive, mood-driven dressing", scores: { creative: 2, influencer: 2, alt: 2 } }
    ]
  },
  {
    category: "Utility vs. Expression",
    question: "When you buy a new piece of clothing, what matters most?",
    sub: "The real reason you pull out your card.",
    layout: "cols-2",
    options: [
      { label: "It needs to be versatile", desc: "Works in multiple contexts", scores: { '9to5er': 3, executive: 2, '1percenter': 1 } },
      { label: "It needs to say something", desc: "Expression, identity, a point of view", scores: { creative: 3, alt: 3, 'hoods-finest': 1 } },
      { label: "It needs to signal quality", desc: "Craftsmanship, material, longevity", scores: { '1percenter': 3, 'rich-housewife': 2, executive: 1 } },
      { label: "It needs cultural relevance", desc: "Connected to a moment, a brand, a scene", scores: { 'hoods-finest': 3, influencer: 3, creative: 1 } }
    ]
  },
  {
    category: "Brand & Designer Orientation",
    question: "How important are specific brands or designers to your wardrobe?",
    sub: "Be honest about the role labels play in your decisions.",
    layout: "cols-2",
    options: [
      { label: "Heritage houses matter deeply", desc: "The history and craftsmanship behind the name", scores: { '1percenter': 3, 'rich-housewife': 2, executive: 1 } },
      { label: "Streetwear brands are central", desc: "The label is part of the look", scores: { 'hoods-finest': 3, influencer: 2, creative: 1 } },
      { label: "I prefer underground labels", desc: "Small, independent, less visible", scores: { alt: 3, creative: 3, '1percenter': 1 } },
      { label: "Brand matters less than fit", desc: "I buy what works regardless of name", scores: { '9to5er': 3, executive: 2, creative: 1 } }
    ]
  },
  {
    category: "Fashion Habits & Behavior",
    question: "Where do you most often discover new fashion ideas?",
    sub: "Your primary source — where your eye goes first.",
    layout: "cols-2",
    options: [
      { label: "Editorial & fashion media", desc: "Magazines, lookbooks, runway coverage", scores: { '1percenter': 3, 'rich-housewife': 2, influencer: 1 } },
      { label: "Social media & creators", desc: "Instagram, TikTok, content I follow", scores: { influencer: 3, 'hoods-finest': 2, '9to5er': 1 } },
      { label: "Street observation", desc: "Real people, real contexts, real life", scores: { creative: 3, alt: 2, 'hoods-finest': 1 } },
      { label: "In-store browsing", desc: "I find it by touching it, trying it on", scores: { '9to5er': 3, 'rich-housewife': 2, executive: 1 } }
    ]
  }
];

export const archetypes = {
  '1percenter': {
    name: 'The 1 Percenter',
    sub: 'Heritage-driven. Quiet luxury. Timeless standards.',
    desc: "You don't dress to impress — you dress to a standard that most people can't place but everyone feels. Your wardrobe is built on heritage, craftsmanship, and an instinct for quality that runs deeper than trend cycles.",
    traits: [
      { name: 'Investment mindset', pct: 95 },
      { name: 'Heritage sensitivity', pct: 88 },
      { name: 'Quiet authority', pct: 82 },
      { name: 'Material discernment', pct: 90 }
    ],
    color: 'linear-gradient(135deg, #CC8B3C, #C2A14D)',
    emoji: '👑'
  },
  influencer: {
    name: 'The Influencer',
    sub: 'Trend-literate. Visually fluent. Culturally present.',
    desc: "You have an innate understanding of what's next before it arrives. Your style is a form of communication — every outfit tells a story designed for an audience.",
    traits: [
      { name: 'Trend awareness', pct: 96 },
      { name: 'Visual storytelling', pct: 88 },
      { name: 'Aesthetic fluency', pct: 85 },
      { name: 'Cultural timing', pct: 90 }
    ],
    color: 'linear-gradient(135deg, #8B9AAF, #6B7C93)',
    emoji: '🤳'
  },
  creative: {
    name: 'The Creative',
    sub: 'Identity-first. Fearless. Self-referential.',
    desc: "Fashion is your primary creative language. You don't follow a scene — you build your own. Thrift, archive, DIY, and high-fashion references all coexist in your wardrobe.",
    traits: [
      { name: 'Personal expression', pct: 97 },
      { name: 'Reference depth', pct: 85 },
      { name: 'Experimental range', pct: 92 },
      { name: 'Cultural awareness', pct: 80 }
    ],
    color: 'linear-gradient(135deg, #2C3E50, #4B6584)',
    emoji: '🎨'
  },
  'hoods-finest': {
    name: "Hood's Finest",
    sub: 'Culture-rooted. Drip-conscious. Unapologetic.',
    desc: "Your style is inseparable from culture. Streetwear isn't a trend for you — it's a mother tongue. You understand the grammar of drops, collabs, and sneaker hierarchies.",
    traits: [
      { name: 'Streetwear fluency', pct: 97 },
      { name: 'Cultural currency', pct: 92 },
      { name: 'Brand awareness', pct: 88 },
      { name: 'Statement confidence', pct: 94 }
    ],
    color: 'linear-gradient(135deg, #6B4C5C, #8B5E6E)',
    emoji: '🔥'
  },
  'rich-housewife': {
    name: 'The Rich Housewife',
    sub: 'Polished. Feminine luxury. Effortlessly composed.',
    desc: "Your style exists at the intersection of luxury and femininity. Designer accessories, neutral palettes, and silhouettes that signal a life well-lived.",
    traits: [
      { name: 'Luxury sensibility', pct: 93 },
      { name: 'Feminine refinement', pct: 90 },
      { name: 'Accessory intelligence', pct: 88 },
      { name: 'Composed elegance', pct: 92 }
    ],
    color: 'linear-gradient(135deg, #B4838D, #C97080)',
    emoji: '🌹'
  },
  executive: {
    name: 'The Executive',
    sub: 'Authoritative. Sharp. Intentionally powerful.',
    desc: "You dress for the outcome, not the compliment. Sharp tailoring, structured silhouettes, and a color discipline that projects authority before you say a word.",
    traits: [
      { name: 'Strategic dressing', pct: 95 },
      { name: 'Structural precision', pct: 90 },
      { name: 'Wardrobe discipline', pct: 88 },
      { name: 'Contextual awareness', pct: 85 }
    ],
    color: 'linear-gradient(135deg, #5D6D7E, #7F8C8D)',
    emoji: '💼'
  },
  '9to5er': {
    name: 'The 9to5er',
    sub: 'Polished versatility. Smart casual. Reliable style.',
    desc: "You've solved one of the hardest problems in fashion: looking consistently good without overthinking it. Your style is versatile, considered, and built for a life that moves.",
    traits: [
      { name: 'Contextual versatility', pct: 92 },
      { name: 'Wardrobe efficiency', pct: 88 },
      { name: 'Consistent execution', pct: 90 },
      { name: 'Smart accessibility', pct: 85 }
    ],
    color: 'linear-gradient(135deg, #7F8C8D, #95A5A6)',
    emoji: '⭐'
  },
  alt: {
    name: 'The Alt',
    sub: 'Anti-mainstream. Subcultural. Deliberately unconventional.',
    desc: "You don't just reject mainstream fashion — you've built an entire alternative visual identity in its place. Dark palettes, unconventional cuts, vintage finds, and a refusal to be categorized.",
    traits: [
      { name: 'Subcultural depth', pct: 94 },
      { name: 'Anti-conformity', pct: 97 },
      { name: 'Dark aesthetic range', pct: 88 },
      { name: 'DIY sensibility', pct: 85 }
    ],
    color: 'linear-gradient(135deg, #34495E, #2C3E50)',
    emoji: '⚡'
  }
};

export const personalityOptions = [
  { value: '1percenter', label: 'The 1 Percenter' },
  { value: 'influencer', label: 'The Influencer' },
  { value: 'creative', label: 'The Creative' },
  { value: 'hoods-finest', label: "The Hood's Finest" },
  { value: 'rich-housewife', label: 'The Rich Housewife' },
  { value: 'executive', label: 'The Executive' },
  { value: '9to5er', label: 'The 9to5er' },
  { value: 'alt', label: 'The Alt' },
];

export function getPersonalityName(type) {
  const names = {
    '1percenter': '1 Percenter',
    influencer: 'Influencer',
    creative: 'Creative',
    'hoods-finest': "Hood's Finest",
    'rich-housewife': 'Rich Housewife',
    executive: 'Executive',
    '9to5er': '9to5er',
    alt: 'Alt'
  };
  return names[type] || type;
}
