export type PlaceKind = 'continent' | 'ocean';

/** Anything that can be pinned to the globe. */
export interface GlobePoint {
  id: string;
  kind: PlaceKind | 'country' | 'region';
  name: string;
  lat: number;
  lon: number;
}

export interface Place extends GlobePoint {
  kind: PlaceKind;
  stats: [label: string, value: string][];
  description: string;
}

export const PLACES: Place[] = [
  {
    id: 'africa',
    kind: 'continent',
    name: 'Africa',
    lat: 4,
    lon: 20,
    stats: [
      ['Area', '30.4M km²'],
      ['Population', '1.5B'],
      ['Countries', '54'],
    ],
    description:
      'The cradle of humankind. From the Sahara to the Congo Basin, Africa spans every climate from desert to rainforest.',
  },
  {
    id: 'asia',
    kind: 'continent',
    name: 'Asia',
    lat: 42,
    lon: 92,
    stats: [
      ['Area', '44.6M km²'],
      ['Population', '4.8B'],
      ['Highest point', '8,849 m'],
    ],
    description:
      'The largest continent, home to six in ten people on Earth and the summit of Everest, where the planet reaches closest to space.',
  },
  {
    id: 'europe',
    kind: 'continent',
    name: 'Europe',
    lat: 52,
    lon: 16,
    stats: [
      ['Area', '10.2M km²'],
      ['Population', '745M'],
      ['Coastline', '38,000 km'],
    ],
    description:
      'A peninsula of peninsulas. Warmed by the Gulf Stream, its intricate coastline shaped centuries of exploration.',
  },
  {
    id: 'north-america',
    kind: 'continent',
    name: 'North America',
    lat: 46,
    lon: -102,
    stats: [
      ['Area', '24.7M km²'],
      ['Population', '600M'],
      ['Largest island', 'Greenland'],
    ],
    description:
      'From Arctic tundra to tropical coasts, with the Great Lakes holding a fifth of the world’s fresh surface water.',
  },
  {
    id: 'south-america',
    kind: 'continent',
    name: 'South America',
    lat: -14,
    lon: -60,
    stats: [
      ['Area', '17.8M km²'],
      ['Population', '440M'],
      ['Longest range', 'Andes'],
    ],
    description:
      'The Amazon breathes here — the largest tropical rainforest on Earth, bordered by the longest mountain range above sea.',
  },
  {
    id: 'oceania',
    kind: 'continent',
    name: 'Australia',
    lat: -25,
    lon: 134,
    stats: [
      ['Area', '8.6M km²'],
      ['Population', '46M'],
      ['Reef length', '2,300 km'],
    ],
    description:
      'The smallest continent and an island world apart, edged by the Great Barrier Reef — a living structure visible from orbit.',
  },
  {
    id: 'antarctica',
    kind: 'continent',
    name: 'Antarctica',
    lat: -78,
    lon: 30,
    stats: [
      ['Area', '14.2M km²'],
      ['Ice share', '~90%'],
      ['Avg. ice depth', '1.9 km'],
    ],
    description:
      'A frozen continent holding most of the world’s ice. If it melted, global seas would rise by nearly sixty metres.',
  },
  {
    id: 'pacific',
    kind: 'ocean',
    name: 'Pacific Ocean',
    lat: 2,
    lon: -150,
    stats: [
      ['Area', '165.2M km²'],
      ['Avg. depth', '4,280 m'],
      ['Deepest', '10,935 m'],
    ],
    description:
      'Larger than all of Earth’s land combined, and home to the Mariana Trench — the deepest place on the planet.',
  },
  {
    id: 'atlantic',
    kind: 'ocean',
    name: 'Atlantic Ocean',
    lat: 14,
    lon: -38,
    stats: [
      ['Area', '106.5M km²'],
      ['Avg. depth', '3,646 m'],
      ['Widening', '~2.5 cm/yr'],
    ],
    description:
      'Split by the Mid-Atlantic Ridge, an underwater mountain chain where new seafloor is born every year.',
  },
  {
    id: 'indian',
    kind: 'ocean',
    name: 'Indian Ocean',
    lat: -22,
    lon: 78,
    stats: [
      ['Area', '70.6M km²'],
      ['Avg. depth', '3,741 m'],
      ['Warmest', 'of all oceans'],
    ],
    description:
      'The warmest ocean on Earth, driving the monsoons that bring rain to billions of people each year.',
  },
  {
    id: 'southern',
    kind: 'ocean',
    name: 'Southern Ocean',
    lat: -60,
    lon: 100,
    stats: [
      ['Area', '21.9M km²'],
      ['Avg. depth', '3,270 m'],
      ['Current', '130× Amazon'],
    ],
    description:
      'Encircling Antarctica, its circumpolar current is the strongest on Earth, linking every other ocean basin.',
  },
  {
    id: 'arctic',
    kind: 'ocean',
    name: 'Arctic Ocean',
    lat: 80,
    lon: -20,
    stats: [
      ['Area', '14.1M km²'],
      ['Avg. depth', '1,205 m'],
      ['Sea ice', 'Seasonal'],
    ],
    description:
      'The smallest and shallowest ocean, crowned by sea ice that breathes with the seasons and reflects sunlight back to space.',
  },
];

export type ElementId = 'land' | 'ocean' | 'atmosphere';

export interface EarthElement {
  id: ElementId;
  index: string;
  title: string;
  lead: string;
  body: string;
  facts: [value: string, label: string][];
}

export const ELEMENTS: EarthElement[] = [
  {
    id: 'land',
    index: 'I',
    title: 'Land',
    lead: 'Continents adrift on a restless mantle.',
    body: 'Only 29% of Earth’s surface rises above the sea, yet it holds every forest, desert and city we know — sculpted over billions of years by plates, ice and rivers.',
    facts: [
      ['29%', 'of the surface'],
      ['8,849 m', 'highest summit'],
      ['31%', 'covered by forest'],
    ],
  },
  {
    id: 'ocean',
    index: 'II',
    title: 'Ocean',
    lead: 'The blue engine of the planet.',
    body: 'Oceans store most of Earth’s heat and produce half of the oxygen we breathe. More than 80% of their depths remain unmapped in detail.',
    facts: [
      ['71%', 'of the surface'],
      ['97%', 'of all water'],
      ['50%', 'of our oxygen'],
    ],
  },
  {
    id: 'atmosphere',
    index: 'III',
    title: 'Atmosphere',
    lead: 'A thin blue line that makes life possible.',
    body: 'A veil barely a hundred kilometres thick shields us from radiation, carries the weather and scatters sunlight into the blue we see from below and above.',
    facts: [
      ['100 km', 'to the edge of space'],
      ['78%', 'nitrogen'],
      ['21%', 'oxygen'],
    ],
  },
];

export interface EarthStat {
  value: number;
  decimals: number;
  unit: string;
  label: string;
  note: string;
}

export const STATS: EarthStat[] = [
  { value: 7, decimals: 0, unit: '', label: 'Continents', note: 'Drifting on fifteen major tectonic plates' },
  { value: 5, decimals: 0, unit: '', label: 'Oceans', note: 'One connected body of water' },
  { value: 8, decimals: 0, unit: 'Billion', label: 'People', note: 'Sharing a single fragile home' },
  { value: 4.5, decimals: 1, unit: 'Billion', label: 'Years', note: 'Since the planet first formed' },
];

export const SECTIONS = [
  { id: 'hero', label: 'Orbit' },
  { id: 'explore', label: 'Explore' },
  { id: 'elements', label: 'Elements' },
  { id: 'stats', label: 'Statistics' },
  { id: 'final', label: 'One Planet' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
