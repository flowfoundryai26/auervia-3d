export type Fragrance = {
  id: string; name: string; tagline: string; family: string; price50: number; price100: number;
  liquid: string; liquidDeep: string; cap: string; accent: string;
  description: string; mood: string; occasion: string; intensity: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  ingredientsNote: string; image: string;
};

export const FRAGRANCES: Fragrance[] = [
  {
    id: 'aurelia-dor', name: "Aurelia d'Or", tagline: 'Radiance, bottled in gold', family: 'Floral Amber',
    price50: 240, price100: 340, liquid: '#d9a441', liquidDeep: '#9a6a1f', cap: '#c6a15b', accent: '#e8c87a',
    description: 'A luminous floral amber that opens with Calabrian light and settles into warm vanilla and sandalwood. Aurelia d’Or is the signature AUREVIA creation — intimate, radiant, unforgettable.',
    mood: 'Luminous · Warm · Confident', occasion: 'Evening & signature wear', intensity: 'Eau de Parfum — 20% parfum (concept specification)',
    notes: { top: ['Calabrian Bergamot', 'Pink Pepper', 'Green Mandarin'], heart: ['Jasmine Sambac', 'Tuberose', 'Orange Blossom'], base: ['Vanilla Bourbon', 'Sandalwood', 'Soft Amber'] },
    ingredientsNote: 'Conceived around jasmine sambac and vanilla bourbon accords, balanced for a smooth, golden dry-down.',
    image: '/images/product-amber.jpg',
  },
  {
    id: 'noir-sublime', name: 'Noir Sublime', tagline: 'Darkness with a heartbeat', family: 'Woody Oriental',
    price50: 260, price100: 365, liquid: '#4a2c14', liquidDeep: '#1f1206', cap: '#171412', accent: '#8a5a2b',
    description: 'An after-dark woody oriental. Black pepper and bergamot cut through oud and rose noir, leaving a trail of amber and supple leather. Magnetic and unhurried.',
    mood: 'Magnetic · Smoky · Assured', occasion: 'After dark & formal occasions', intensity: 'Eau de Parfum — 22% parfum (concept specification)',
    notes: { top: ['Black Pepper', 'Bergamot', 'Cardamom'], heart: ['Oud Accord', 'Rose Noir', 'Iris Butter'], base: ['Amber Resin', 'Leather Accord', 'Cedarwood'] },
    ingredientsNote: 'Built on an oud and leather accord structure, rounded with iris butter for a powdery, elegant heart.',
    image: '/images/hero-fallback.jpg',
  },
  {
    id: 'ivory-veil', name: 'Ivory Veil', tagline: 'Softness that stays in the room', family: 'White Floral Musk',
    price50: 225, price100: 315, liquid: '#e8dcc3', liquidDeep: '#c9b48a', cap: '#e9e2d3', accent: '#d8c39a',
    description: 'A clean white-floral veil. Neroli and pear melt into orange blossom and iris, then into white musk and cashmere wood — like silk remembered on skin.',
    mood: 'Serene · Silky · Close to skin', occasion: 'Daylight, weddings & quiet luxury', intensity: 'Eau de Parfum — 18% parfum (concept specification)',
    notes: { top: ['Neroli', 'Williams Pear', 'Aldehydic Sparkle'], heart: ['Orange Blossom', 'Iris', 'Lily of the Valley'], base: ['White Musk', 'Cashmere Wood', 'Rice Milk Accord'] },
    ingredientsNote: 'Centred on orange blossom and iris, with a soft musk base designed to sit close and linger gently.',
    image: '/images/notes.jpg',
  },
  {
    id: 'velour-mystique', name: 'Velour Mystique', tagline: 'Velvet, spice and intrigue', family: 'Spiced Rose',
    price50: 250, price100: 350, liquid: '#7a2438', liquidDeep: '#3d1020', cap: '#2a1420', accent: '#a84a62',
    description: 'A spiced rose with a velvet depth. Saffron flickers over Turkish rose and patchouli before tonka and suede draw the fragrance into shadow.',
    mood: 'Velvety · Spiced · Enigmatic', occasion: 'Evenings & statement moments', intensity: 'Eau de Parfum — 21% parfum (concept specification)',
    notes: { top: ['Saffron', 'Cardamom', 'Raspberry Leaf'], heart: ['Turkish Rose', 'Patchouli', 'Geranium'], base: ['Tonka Bean', 'Suede Accord', 'Benzoin'] },
    ingredientsNote: 'Saffron and rose form the signature tension — spice against petal — softened by tonka in the base.',
    image: '/images/story.jpg',
  },
];

export type CartItem = { key: string; fragranceId: string; size: 50 | 100; qty: number };
export const priceFor = (f: Fragrance, size: 50 | 100) => (size === 50 ? f.price50 : f.price100);
export const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
