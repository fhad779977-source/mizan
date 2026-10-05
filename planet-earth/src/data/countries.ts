/**
 * Countries → regions/cities → city guides.
 *
 * Guides are curated, well-established picks. Ratings change over time, so the
 * UI links every spot to a live map search instead of printing a score.
 */

export interface Spot {
  name: string;
  /** District or neighbourhood. */
  area: string;
  note: string;
}

export interface CityGuide {
  landmarks: Spot[];
  cafes: Spot[];
  restaurants: Spot[];
}

export interface Region {
  id: string;
  kind: 'region';
  name: string;
  lat: number;
  lon: number;
  tagline: string;
  description: string;
  guide?: CityGuide;
}

export interface Country {
  id: string;
  kind: 'country';
  code: string;
  name: string;
  lat: number;
  lon: number;
  capital: string;
  population: string;
  area: string;
  summary: string;
  /** How close the camera dives when the country is opened (0..1); small countries go deeper. */
  zoom: number;
  regions: Region[];
}

const r = (
  id: string,
  name: string,
  lat: number,
  lon: number,
  tagline: string,
  description: string,
  guide?: CityGuide,
): Region => ({ id, kind: 'region', name, lat, lon, tagline, description, guide });

/* ------------------------------------------------------------------ */
/* City guides                                                         */
/* ------------------------------------------------------------------ */

const RIYADH: CityGuide = {
  landmarks: [
    { name: 'At-Turaif District', area: 'Diriyah', note: 'UNESCO World Heritage mud-brick citadel, the birthplace of the first Saudi state.' },
    { name: 'Bujairi Terrace', area: 'Diriyah', note: 'Dining terrace facing At-Turaif across Wadi Hanifah, best at sunset.' },
    { name: 'Kingdom Centre Tower', area: 'Al Olaya', note: '302 m tower with a Sky Bridge walkway 300 m above the city.' },
    { name: 'Masmak Fortress', area: 'Al Dirah', note: 'Clay-and-mud fort at the heart of old Riyadh and its founding story.' },
    { name: 'National Museum of Saudi Arabia', area: 'Al Murabba', note: 'Eight galleries tracing Arabia from prehistory to the modern kingdom.' },
    { name: 'Murabba Palace', area: 'Al Murabba', note: 'King Abdulaziz’s 1930s palace, set in the King Abdulaziz Historical Center.' },
    { name: 'Al Faisaliah Tower', area: 'Al Olaya', note: 'The city’s first skyscraper, crowned by its golden glass globe.' },
    { name: 'Edge of the World', area: 'Jebel Fihrayn', note: 'Sheer Tuwaiq escarpment cliffs about 90 km north-west of the city.' },
    { name: 'Boulevard City', area: 'Hittin', note: 'Entertainment district and a main stage of Riyadh Season.' },
  ],
  cafes: [
    { name: 'Overdose Coffee', area: 'Riyadh', note: 'Home-grown specialty roaster known for precise filter brews.' },
    { name: 'Brew92', area: 'Riyadh', note: 'Saudi specialty coffee house with its own roastery.' },
    { name: 'Elixir Bunn', area: 'Riyadh', note: 'Pioneering Saudi third-wave roaster and coffee bar.' },
    { name: 'Camel Step', area: 'Riyadh', note: 'Specialty roaster loved for single-origin beans.' },
    { name: 'Draft Cafe', area: 'Riyadh', note: 'Design-led cafe with a calm, minimal interior.' },
    { name: '% Arabica', area: 'Riyadh', note: 'Kyoto-born specialty brand famous for its lattes.' },
  ],
  restaurants: [
    { name: 'Najd Village', area: 'Al Takhassusi', note: 'Traditional Najdi dishes such as jareesh and kabsa, in a heritage setting.' },
    { name: 'Maiz', area: 'Bujairi Terrace', note: 'Contemporary takes on Saudi home cooking with a view of At-Turaif.' },
    { name: 'Lusin', area: 'Riyadh', note: 'Refined Armenian cuisine, a long-time Riyadh favourite.' },
    { name: 'Villa Mamas', area: 'Bujairi Terrace', note: 'Bahraini and Gulf home-style cooking.' },
    { name: 'Spazio 77', area: 'Kingdom Centre', note: 'Italian dining on the 77th floor with views across the city.' },
    { name: 'LPM Riyadh', area: 'Riyadh', note: 'French Mediterranean restaurant and bar.' },
    { name: 'Myazu', area: 'Riyadh', note: 'Modern Japanese cuisine and sushi.' },
  ],
};

const JEDDAH: CityGuide = {
  landmarks: [
    { name: 'Al-Balad (Historic Jeddah)', area: 'Al-Balad', note: 'UNESCO-listed coral-stone houses with carved rawasheen balconies.' },
    { name: 'Nassif House', area: 'Al-Balad', note: 'A 19th-century merchant house, now a museum of old Jeddah.' },
    { name: 'King Fahd’s Fountain', area: 'Corniche', note: 'One of the tallest fountains in the world, lit up at night.' },
    { name: 'Al-Rahma Mosque', area: 'Corniche', note: 'The “floating mosque”, built over the Red Sea.' },
    { name: 'Jeddah Corniche', area: 'Waterfront', note: 'A 30 km seafront promenade with sculptures and beaches.' },
    { name: 'Jeddah Yacht Club & Marina', area: 'North Corniche', note: 'Waterfront marina with restaurants and Red Sea sunsets.' },
    { name: 'Tayebat Museum', area: 'Al Faisaliyah', note: 'Large museum of Hijazi heritage and Islamic history.' },
  ],
  cafes: [
    { name: 'Brew92', area: 'Jeddah', note: 'A pioneer of Saudi third-wave coffee.' },
    { name: 'Meraki Artisan', area: 'Ar Rawdah', note: 'Specialty roaster and coffee bar.' },
    { name: 'Tmal Speciality Coffee', area: 'Jeddah', note: 'Cosy, affordable specialty coffee.' },
    { name: 'Camel Step', area: 'Jeddah', note: 'Respected Saudi roaster known for consistency.' },
    { name: 'Ash Cafe', area: 'Jeddah', note: 'Local brand with in-house roasting and bright interiors.' },
  ],
  restaurants: [
    { name: 'Al-Nakheel Restaurant', area: 'Corniche', note: 'Hijazi dishes on a large terrace with a sea breeze.' },
    { name: 'Najat Al-Shaabi', area: 'Al-Balad', note: 'Old-Jeddah classics: mutabbaq, masoub and mugalgal.' },
    { name: 'Samia’s Dish', area: 'Jeddah', note: 'Affordable, home-style Hijazi cooking.' },
    { name: 'Hummus Al Jalal', area: 'Al-Balad', note: 'Generations-old foul recipe with morning queues.' },
    { name: 'Al Basali Restaurant', area: 'Near Bab Makkah', note: 'Red Sea seafood such as grilled hammour.' },
    { name: 'Al Baik', area: 'Citywide', note: 'The broasted-chicken chain that started in Jeddah in 1974.' },
  ],
};

const ALULA: CityGuide = {
  landmarks: [
    { name: 'Hegra', area: 'AlUla', note: 'Saudi Arabia’s first UNESCO site: over 100 Nabataean tombs.' },
    { name: 'Elephant Rock', area: 'AlUla', note: 'A 52 m natural arch shaped like an elephant, best at dusk.' },
    { name: 'Maraya', area: 'Ashar Valley', note: 'The world’s largest mirrored building.' },
    { name: 'AlUla Old Town', area: 'AlUla', note: 'Mud-brick lanes from the 12th century, with shops and cafés.' },
    { name: 'Dadan', area: 'AlUla', note: 'Capital of the ancient Dadan and Lihyan kingdoms.' },
    { name: 'Jabal Ikmah', area: 'AlUla', note: 'An open-air library of ancient rock inscriptions.' },
    { name: 'Harrat Viewpoint', area: 'AlUla', note: 'Volcanic plateau lookout over the whole valley.' },
  ],
  cafes: [
    { name: 'Tomoor AlUla', area: 'Old Town', note: 'Modern Saudi café built around AlUla dates.' },
    { name: 'Wacafe', area: 'Old Town', note: 'Relaxed café in the heart of Old Town.' },
  ],
  restaurants: [
    { name: 'Maraya Social', area: 'Maraya', note: 'Rooftop restaurant by chef Jason Atherton; booking required.' },
    { name: 'Saffron', area: 'Banyan Tree AlUla', note: 'The resort’s signature Thai restaurant.' },
    { name: 'Tofareya', area: 'Old Town', note: 'Traditional Saudi dishes.' },
    { name: 'Villa Fayrouz', area: 'Old Town', note: 'Lebanese mezze and grills.' },
    { name: 'Entrecôte Café de Paris', area: 'Old Town', note: 'French steak-frites classic.' },
  ],
};

const MAKKAH: CityGuide = {
  landmarks: [
    { name: 'Masjid al-Haram', area: 'Central Makkah', note: 'The Grand Mosque surrounding the Kaaba, the qibla for Muslims worldwide.' },
    { name: 'Jabal al-Nour', area: 'North-east Makkah', note: 'The mountain of the Cave of Hira, where the first revelation came.' },
    { name: 'Makkah Clock Tower', area: 'Abraj Al Bait', note: 'One of the world’s tallest buildings, with a clock museum.' },
  ],
  cafes: [],
  restaurants: [],
};

const MADINAH: CityGuide = {
  landmarks: [
    { name: 'Al-Masjid an-Nabawi', area: 'Central Madinah', note: 'The Prophet’s Mosque, the second holiest site in Islam.' },
    { name: 'Quba Mosque', area: 'Quba', note: 'The first mosque built in Islam.' },
    { name: 'Mount Uhud', area: 'North Madinah', note: 'Site of the Battle of Uhud.' },
    { name: 'Hejaz Railway Museum', area: 'Al Anbariyah', note: 'The historic 1908 railway station, now a museum.' },
  ],
  cafes: [],
  restaurants: [],
};

const ABHA: CityGuide = {
  landmarks: [
    { name: 'Rijal Almaa', area: 'An hour from Abha', note: 'A 900-year-old village of stone, clay and wood towers.' },
    { name: 'Al Soudah', area: 'Asir mountains', note: 'Misty highlands near the kingdom’s highest peaks.' },
    { name: 'Al Habala', area: 'South-west of Abha', note: 'The “hanging village” on a cliff, reached by cable car.' },
    { name: 'Al Muftaha Village', area: 'Central Abha', note: 'Historic village with Asiri murals, galleries and cafés.' },
    { name: 'Art Street', area: 'Abha', note: 'A relaxed walk of public art, cafés and seasonal events.' },
  ],
  cafes: [{ name: 'Bees Tower Honey Refinery', area: 'Near Rijal Almaa', note: 'Coffee and local honey with views of green mountains.' }],
  restaurants: [],
};

const KHOBAR: CityGuide = {
  landmarks: [
    { name: 'Al Khobar Corniche', area: 'Waterfront', note: 'A long Gulf-side promenade, busiest in the evening.' },
    { name: 'King Fahd Causeway', area: 'West of Khobar', note: 'The 25 km bridge-and-island link to Bahrain.' },
    { name: 'Ithra', area: 'Dhahran', note: 'King Abdulaziz Center for World Culture: museum, library and cinema.' },
    { name: 'Half Moon Bay', area: 'South of Khobar', note: 'A curved bay of calm water and beaches.' },
  ],
  cafes: [
    { name: 'Andes Roasters', area: 'Al Khobar', note: 'Specialty roastery with a strong local following.' },
    { name: 'Camel Step', area: 'Al Khobar', note: 'Saudi specialty roaster.' },
    { name: 'August Cafe', area: 'Corniche', note: 'Popular café on the corniche.' },
  ],
  restaurants: [
    { name: 'Nozomi', area: 'Corniche', note: 'Elegant Japanese with a terrace over the Gulf.' },
    { name: 'Café Chic', area: 'Sofitel Al Khobar The Corniche', note: 'French cuisine with Gulf views.' },
    { name: 'Heritage Village', area: 'Al Khobar', note: 'Traditional Saudi dishes such as kabsa and mandi.' },
  ],
};

const ISTANBUL: CityGuide = {
  landmarks: [
    { name: 'Hagia Sophia', area: 'Sultanahmet', note: 'A sixth-century dome that has stood for 1,500 years.' },
    { name: 'Blue Mosque', area: 'Sultanahmet', note: 'Ottoman mosque lined with blue Iznik tiles.' },
    { name: 'Topkapı Palace', area: 'Sultanahmet', note: 'Seat of the Ottoman sultans for four centuries.' },
    { name: 'Grand Bazaar', area: 'Fatih', note: 'One of the oldest and largest covered markets in the world.' },
    { name: 'Galata Tower', area: 'Beyoğlu', note: 'Medieval stone tower with a 360° view of the Golden Horn.' },
  ],
  cafes: [
    { name: 'Mandabatmaz', area: 'Beyoğlu', note: 'Tiny spot famous for thick Turkish coffee.' },
    { name: 'Pierre Loti Café', area: 'Eyüp', note: 'Hilltop tea garden over the Golden Horn.' },
    { name: 'Hafız Mustafa 1864', area: 'Sirkeci', note: 'Historic shop for baklava and Turkish delight.' },
  ],
  restaurants: [
    { name: 'Pandeli', area: 'Spice Bazaar', note: 'Ottoman cooking above the bazaar since 1901.' },
    { name: 'Hamdi Restaurant', area: 'Eminönü', note: 'Kebabs with a view of the Golden Horn.' },
    { name: 'Çiya Sofrası', area: 'Kadıköy', note: 'Regional Anatolian dishes on the Asian side.' },
    { name: 'Karaköy Güllüoğlu', area: 'Karaköy', note: 'The city’s best-known baklava house.' },
  ],
};

const ROME: CityGuide = {
  landmarks: [
    { name: 'The Colosseum', area: 'Centro Storico', note: 'The largest amphitheatre ever built, finished in 80 AD.' },
    { name: 'Roman Forum', area: 'Centro Storico', note: 'The ruined heart of ancient Rome.' },
    { name: 'Pantheon', area: 'Piazza della Rotonda', note: 'A 2,000-year-old temple with an open oculus.' },
    { name: 'Trevi Fountain', area: 'Trevi', note: 'Baroque fountain; a coin tossed in promises a return.' },
    { name: 'Vatican Museums', area: 'Vatican City', note: 'Home of the Sistine Chapel ceiling.' },
  ],
  cafes: [
    { name: 'Sant’Eustachio Il Caffè', area: 'Near the Pantheon', note: 'Legendary espresso since 1938.' },
    { name: 'Antico Caffè Greco', area: 'Via Condotti', note: 'Rome’s oldest café, open since 1760.' },
    { name: 'Tazza d’Oro', area: 'Near the Pantheon', note: 'Famous for granita di caffè.' },
  ],
  restaurants: [
    { name: 'Roscioli', area: 'Campo de’ Fiori', note: 'Deli-restaurant known for carbonara.' },
    { name: 'Da Enzo al 29', area: 'Trastevere', note: 'Small, classic Roman trattoria.' },
    { name: 'Armando al Pantheon', area: 'Near the Pantheon', note: 'Family-run Roman cooking since 1961.' },
  ],
};

const TOKYO: CityGuide = {
  landmarks: [
    { name: 'Senso-ji', area: 'Asakusa', note: 'Tokyo’s oldest temple, founded in 645.' },
    { name: 'Shibuya Crossing', area: 'Shibuya', note: 'The world’s busiest pedestrian scramble.' },
    { name: 'Meiji Jingu', area: 'Harajuku', note: 'Forest shrine to Emperor Meiji.' },
    { name: 'Tokyo Skytree', area: 'Sumida', note: 'A 634 m broadcasting tower with observation decks.' },
    { name: 'teamLab Planets', area: 'Toyosu', note: 'Immersive digital-art museum.' },
  ],
  cafes: [
    { name: 'Blue Bottle Coffee Kiyosumi', area: 'Kiyosumi-Shirakawa', note: 'The brand’s first café in Japan, in a converted warehouse.' },
    { name: 'Fuglen Tokyo', area: 'Tomigaya', note: 'Oslo coffee bar with vintage Norwegian design.' },
  ],
  restaurants: [
    { name: 'Ichiran Shibuya', area: 'Shibuya', note: 'Tonkotsu ramen eaten in private booths.' },
    { name: 'AFURI Ebisu', area: 'Ebisu', note: 'Light yuzu-shio ramen.' },
    { name: 'Tsukiji Outer Market', area: 'Tsukiji', note: 'Street stalls for sushi, tamagoyaki and seafood.' },
  ],
};

const CAIRO: CityGuide = {
  landmarks: [
    { name: 'Pyramids of Giza', area: 'Giza', note: 'The Great Pyramid, built around 2560 BC.' },
    { name: 'Grand Egyptian Museum', area: 'Giza', note: 'The world’s largest museum devoted to one civilisation.' },
    { name: 'Khan el-Khalili', area: 'Islamic Cairo', note: 'Historic bazaar dating to the 14th century.' },
    { name: 'Cairo Citadel', area: 'Mokattam', note: 'Saladin’s fortress and the Muhammad Ali Mosque.' },
  ],
  cafes: [{ name: 'El Fishawy', area: 'Khan el-Khalili', note: 'Mirror-lined café serving mint tea since the 18th century.' }],
  restaurants: [
    { name: 'Abou Tarek', area: 'Downtown', note: 'The city’s most famous koshari.' },
    { name: 'Felfela', area: 'Downtown', note: 'Egyptian classics such as ful and ta’ameya since 1959.' },
    { name: 'Naguib Mahfouz Café', area: 'Khan el-Khalili', note: 'Egyptian dishes in a calm courtyard inside the bazaar.' },
  ],
};

const BARCELONA: CityGuide = {
  landmarks: [
    { name: 'Sagrada Família', area: 'Eixample', note: 'Gaudí’s basilica, under construction since 1882.' },
    { name: 'Park Güell', area: 'Gràcia', note: 'Mosaic terraces overlooking the city.' },
    { name: 'Casa Batlló', area: 'Passeig de Gràcia', note: 'Gaudí’s dragon-roofed house.' },
    { name: 'Gothic Quarter', area: 'Ciutat Vella', note: 'Medieval lanes around the cathedral.' },
  ],
  cafes: [{ name: 'Granja M. Viader', area: 'El Raval', note: 'Hot chocolate and churros since 1870.' }],
  restaurants: [
    { name: 'Cervecería Catalana', area: 'Eixample', note: 'Busy, much-loved tapas bar.' },
    { name: 'La Boqueria', area: 'La Rambla', note: 'The city’s great food market, with counter bars.' },
  ],
};

const LONDON: CityGuide = {
  landmarks: [
    { name: 'Tower of London', area: 'Tower Hill', note: 'A 1,000-year-old fortress and home of the Crown Jewels.' },
    { name: 'British Museum', area: 'Bloomsbury', note: 'Two million years of human history, free to enter.' },
    { name: 'Westminster & Big Ben', area: 'Westminster', note: 'The Houses of Parliament and the Elizabeth Tower.' },
    { name: 'Buckingham Palace', area: 'St James’s', note: 'The monarch’s London residence and the Changing of the Guard.' },
    { name: 'Tower Bridge', area: 'Southwark', note: 'Victorian bascule bridge with a glass-floored walkway.' },
    { name: 'The Shard', area: 'London Bridge', note: 'Western Europe’s tallest building, with a 72nd-floor view.' },
  ],
  cafes: [
    { name: 'Monmouth Coffee', area: 'Covent Garden', note: 'A pioneer of London’s specialty coffee scene since 1978.' },
    { name: 'Prufrock Coffee', area: 'Clerkenwell', note: 'Respected espresso bar and barista-training hub.' },
  ],
  restaurants: [
    { name: 'Dishoom', area: 'Covent Garden', note: 'Bombay-café cooking; the black daal is famous.' },
    { name: 'Rules', area: 'Covent Garden', note: 'London’s oldest restaurant, serving British classics since 1798.' },
    { name: 'The Ivy', area: 'West Street', note: 'A theatreland institution since 1917.' },
  ],
};

const NEW_YORK: CityGuide = {
  landmarks: [
    { name: 'Statue of Liberty', area: 'Liberty Island', note: 'The 1886 gift from France that greets the harbour.' },
    { name: 'Central Park', area: 'Manhattan', note: '341 hectares of meadows, lakes and bridges.' },
    { name: 'Empire State Building', area: 'Midtown', note: 'Art-deco icon with open-air observation decks.' },
    { name: 'Times Square', area: 'Midtown', note: 'The neon crossroads of Broadway.' },
    { name: 'The Metropolitan Museum of Art', area: 'Upper East Side', note: 'Five thousand years of art under one roof.' },
    { name: 'Brooklyn Bridge', area: 'Lower Manhattan', note: 'The 1883 suspension bridge, best walked at dawn.' },
  ],
  cafes: [
    { name: 'Joe Coffee', area: 'Greenwich Village', note: 'Local specialty coffee chain born in the Village.' },
    { name: 'La Colombe', area: 'SoHo', note: 'Home of the draft latte.' },
  ],
  restaurants: [
    { name: 'Katz’s Delicatessen', area: 'Lower East Side', note: 'Pastrami on rye, served since 1888.' },
    { name: 'Le Bernardin', area: 'Midtown', note: 'Celebrated seafood fine dining.' },
    { name: 'Joe’s Pizza', area: 'Greenwich Village', note: 'The classic New York slice.' },
  ],
};

const PARIS: CityGuide = {
  landmarks: [
    { name: 'Eiffel Tower', area: '7th arr.', note: 'The 330 m iron lattice tower from 1889.' },
    { name: 'Louvre Museum', area: '1st arr.', note: 'The world’s most visited museum, home of the Mona Lisa.' },
    { name: 'Notre-Dame de Paris', area: 'Île de la Cité', note: 'Gothic cathedral, reopened in 2024 after restoration.' },
    { name: 'Arc de Triomphe', area: 'Champs-Élysées', note: 'Napoleon’s triumphal arch with a rooftop view.' },
    { name: 'Sacré-Cœur', area: 'Montmartre', note: 'White-domed basilica on the city’s highest hill.' },
  ],
  cafes: [
    { name: 'Café de Flore', area: 'Saint-Germain', note: 'Literary café since the 1880s.' },
    { name: 'Les Deux Magots', area: 'Saint-Germain', note: 'Historic café opposite the oldest church in Paris.' },
    { name: 'Angelina', area: 'Rue de Rivoli', note: 'Famous for its thick hot chocolate and Mont-Blanc.' },
  ],
  restaurants: [
    { name: 'Le Jules Verne', area: 'Eiffel Tower', note: 'Fine dining on the tower’s second floor.' },
    { name: 'Bouillon Chartier', area: '9th arr.', note: 'Belle-époque dining hall serving classics since 1896.' },
  ],
};

const DUBAI: CityGuide = {
  landmarks: [
    { name: 'Burj Khalifa', area: 'Downtown', note: 'The world’s tallest building at 828 m.' },
    { name: 'The Dubai Fountain', area: 'Downtown', note: 'Choreographed fountain shows at the foot of the Burj.' },
    { name: 'Al Fahidi Historical District', area: 'Bur Dubai', note: 'Wind-tower houses along the creek.' },
    { name: 'Museum of the Future', area: 'Sheikh Zayed Road', note: 'Torus-shaped museum wrapped in Arabic calligraphy.' },
    { name: 'Palm Jumeirah', area: 'Jumeirah', note: 'The palm-shaped island visible from space.' },
  ],
  cafes: [
    { name: 'Arabian Tea House', area: 'Al Fahidi', note: 'Courtyard café serving Emirati breakfast.' },
    { name: 'Tom & Serg', area: 'Al Quoz', note: 'Industrial-style brunch spot and specialty coffee.' },
  ],
  restaurants: [
    { name: 'Al Ustad Special Kebab', area: 'Al Fahidi', note: 'Iranian kebab house open since 1978.' },
    { name: 'Ravi Restaurant', area: 'Satwa', note: 'Beloved, no-frills Pakistani kitchen.' },
    { name: 'At.mosphere', area: 'Burj Khalifa', note: 'Dining on level 122 of the Burj Khalifa.' },
  ],
};

const landmarksOnly = (...landmarks: Spot[]): CityGuide => ({ landmarks, cafes: [], restaurants: [] });

/* ------------------------------------------------------------------ */
/* Countries                                                           */
/* ------------------------------------------------------------------ */

export const COUNTRIES: Country[] = [
  {
    id: 'saudi-arabia',
    kind: 'country',
    code: 'SA',
    zoom: 0.5,
    name: 'Saudi Arabia',
    lat: 24,
    lon: 45,
    capital: 'Riyadh',
    population: '~35M',
    area: '2.15M km²',
    summary: 'The heart of the Arabian Peninsula: red-sand deserts, Red Sea reefs, ancient Nabataean tombs and fast-rising cities.',
    regions: [
      r('riyadh', 'Riyadh', 24.7136, 46.6753, 'The capital', 'A capital of glass towers rising from the Najd plateau, with the mud-brick roots of Diriyah at its edge.', RIYADH),
      r('jeddah', 'Jeddah', 21.4858, 39.1925, 'Gateway to the Red Sea', 'Port city of coral-stone houses, a long corniche and the gateway for pilgrims to Makkah.', JEDDAH),
      r('makkah', 'Makkah', 21.3891, 39.8579, 'The holiest city in Islam', 'Home of the Masjid al-Haram and the Kaaba, welcoming millions of pilgrims every year.', MAKKAH),
      r('madinah', 'Madinah', 24.5247, 39.5692, 'City of the Prophet', 'Home of the Prophet’s Mosque and Quba Mosque, the first mosque in Islam.', MADINAH),
      r(
        'alula',
        'AlUla',
        26.6085,
        37.9232,
        'Open-air museum',
        'Sandstone canyons and Hegra, Saudi Arabia’s first UNESCO site, with over 100 Nabataean tombs.',
        ALULA,
      ),
      r('abha', 'Abha', 18.2465, 42.5117, 'Mountains of Asir', 'Cool highland city at 2,200 m, with misty peaks and colourful Asiri architecture.', ABHA),
      r('khobar', 'Al Khobar', 26.2172, 50.1971, 'The Eastern Province', 'Gulf-side city linked to Bahrain by the King Fahd Causeway.', KHOBAR),
      r('neom', 'NEOM', 28.0, 35.2, 'Red Sea frontier', 'A vast development region on the Gulf of Aqaba, with mountains that meet the sea.'),
    ],
  },
  {
    id: 'united-states',
    kind: 'country',
    code: 'US',
    zoom: 0.2,
    name: 'United States',
    lat: 39.8,
    lon: -98.6,
    capital: 'Washington, D.C.',
    population: '~335M',
    area: '9.83M km²',
    summary: 'Fifty states spanning deserts, mountains, megacities and national parks from coast to coast.',
    regions: [
      r('new-york', 'New York', 40.7128, -74.006, 'The city that never sleeps', 'Five boroughs of skyscrapers, museums and neighbourhoods from every corner of the world.', NEW_YORK),
      r(
        'washington',
        'Washington, D.C.',
        38.9072,
        -77.0369,
        'The capital',
        'Marble monuments and the free museums of the Smithsonian along the National Mall.',
        landmarksOnly(
          { name: 'The National Mall', area: 'Downtown', note: 'Monuments and memorials from the Capitol to the Lincoln Memorial.' },
          { name: 'Smithsonian Air and Space Museum', area: 'National Mall', note: 'Aircraft and spacecraft that made history.' },
        ),
      ),
      r(
        'los-angeles',
        'Los Angeles',
        34.0522,
        -118.2437,
        'Home of Hollywood',
        'Sun, beaches and the film industry, sprawled between mountains and the Pacific.',
        landmarksOnly(
          { name: 'Hollywood Sign', area: 'Hollywood Hills', note: 'The world-famous letters above the city.' },
          { name: 'Griffith Observatory', area: 'Griffith Park', note: 'Free observatory with views of the whole basin.' },
          { name: 'Santa Monica Pier', area: 'Santa Monica', note: 'Historic pier and the end of Route 66.' },
        ),
      ),
      r(
        'san-francisco',
        'San Francisco',
        37.7749,
        -122.4194,
        'City by the Bay',
        'Steep hills, cable cars and fog rolling under the Golden Gate.',
        landmarksOnly(
          { name: 'Golden Gate Bridge', area: 'Presidio', note: 'The 1937 suspension bridge in International Orange.' },
          { name: 'Alcatraz Island', area: 'San Francisco Bay', note: 'The former federal prison on its island.' },
        ),
      ),
      r('las-vegas', 'Las Vegas', 36.1699, -115.1398, 'Desert lights', 'A neon resort city in the Mojave Desert, gateway to the canyon country.'),
      r('miami', 'Miami', 25.7617, -80.1918, 'Gateway to the Americas', 'Art-deco beaches, Latin culture and the Everglades on its doorstep.'),
      r('grand-canyon', 'Grand Canyon', 36.1069, -112.1129, 'A mile-deep wonder', 'Carved by the Colorado River over millions of years; up to 1.8 km deep.'),
      r('chicago', 'Chicago', 41.8781, -87.6298, 'Birthplace of the skyscraper', 'Architecture, deep-dish pizza and the shores of Lake Michigan.'),
    ],
  },
  {
    id: 'united-kingdom',
    kind: 'country',
    code: 'GB',
    zoom: 0.85,
    name: 'United Kingdom',
    lat: 54,
    lon: -2,
    capital: 'London',
    population: '~68M',
    area: '244K km²',
    summary: 'England, Scotland, Wales and Northern Ireland: royal history, rolling countryside and world-class museums.',
    regions: [
      r('london', 'London', 51.5074, -0.1278, 'The capital', 'Two thousand years of history on the Thames, from the Tower to the Shard.', LONDON),
      r(
        'edinburgh',
        'Edinburgh',
        55.9533,
        -3.1883,
        'Scotland’s capital',
        'A castle on volcanic rock above a medieval Old Town and a Georgian New Town.',
        landmarksOnly(
          { name: 'Edinburgh Castle', area: 'Castle Rock', note: 'Fortress on an extinct volcano, home of the Honours of Scotland.' },
          { name: 'The Royal Mile', area: 'Old Town', note: 'The historic street from the castle to Holyrood Palace.' },
          { name: 'Arthur’s Seat', area: 'Holyrood Park', note: 'An easy hike to a peak with sweeping city views.' },
        ),
      ),
      r('manchester', 'Manchester', 53.4808, -2.2426, 'Northern powerhouse', 'Industrial heritage, music history and two world-famous football clubs.'),
      r('oxford', 'Oxford', 51.752, -1.2577, 'City of dreaming spires', 'Home of the oldest university in the English-speaking world.'),
      r('lake-district', 'Lake District', 54.4609, -3.0886, 'England’s largest national park', 'Glacial lakes and fells that inspired Wordsworth and Beatrix Potter.'),
      r('bath', 'Bath', 51.3811, -2.359, 'Roman spa city', 'Honey-coloured Georgian terraces and the best-preserved Roman baths in Britain.'),
    ],
  },
  {
    id: 'france',
    kind: 'country',
    code: 'FR',
    zoom: 0.75,
    name: 'France',
    lat: 46.6,
    lon: 2.2,
    capital: 'Paris',
    population: '~68M',
    area: '552K km²',
    summary: 'The world’s most visited country, from Parisian boulevards to Alpine peaks and the Riviera.',
    regions: [
      r('paris', 'Paris', 48.8566, 2.3522, 'The City of Light', 'Boulevards, cafés and the world’s greatest museums along the Seine.', PARIS),
      r('nice', 'Nice', 43.7102, 7.262, 'The Riviera', 'Azure water and the Promenade des Anglais on the Mediterranean.'),
      r('lyon', 'Lyon', 45.764, 4.8357, 'Capital of gastronomy', 'Renaissance lanes and traditional bouchons where two rivers meet.'),
      r('mont-saint-michel', 'Mont-Saint-Michel', 48.6361, -1.5115, 'An island abbey', 'A medieval abbey on a tidal island off the Normandy coast.'),
    ],
  },
  {
    id: 'japan',
    kind: 'country',
    code: 'JP',
    zoom: 0.72,
    name: 'Japan',
    lat: 36.2,
    lon: 138.25,
    capital: 'Tokyo',
    population: '~124M',
    area: '378K km²',
    summary: 'An island nation where ancient temples sit beside the world’s largest metropolis.',
    regions: [
      r(
        'tokyo',
        'Tokyo',
        35.6762,
        139.6503,
        'The world’s largest city',
        'Neon districts, quiet shrines and more Michelin stars than any other city.',
        TOKYO,
      ),
      r('kyoto', 'Kyoto', 35.0116, 135.7681, 'The old capital', 'More than 1,600 temples, bamboo groves and the Gion geisha district.'),
      r('osaka', 'Osaka', 34.6937, 135.5023, 'Japan’s kitchen', 'Street food capital with a famous castle and neon Dotonbori.'),
      r('fuji', 'Mount Fuji', 35.3606, 138.7274, 'The sacred mountain', 'Japan’s highest peak at 3,776 m, a near-perfect volcanic cone.'),
    ],
  },
  {
    id: 'italy',
    kind: 'country',
    code: 'IT',
    zoom: 0.75,
    name: 'Italy',
    lat: 42.8,
    lon: 12.5,
    capital: 'Rome',
    population: '~59M',
    area: '301K km²',
    summary: 'The cradle of the Roman Empire and the Renaissance, with more UNESCO sites than any other country.',
    regions: [
      r(
        'rome',
        'Rome',
        41.9028,
        12.4964,
        'The Eternal City',
        'Three thousand years of history, from the Forum to St Peter’s.',
        ROME,
      ),
      r('venice', 'Venice', 45.4408, 12.3155, 'City of canals', '118 islands linked by 400 bridges in a lagoon.'),
      r('florence', 'Florence', 43.7696, 11.2558, 'Birthplace of the Renaissance', 'Brunelleschi’s dome, the Uffizi and Michelangelo’s David.'),
      r('amalfi', 'Amalfi Coast', 40.634, 14.6027, 'Cliffside villages', 'Pastel towns stacked above the Tyrrhenian Sea.'),
    ],
  },
  {
    id: 'uae',
    kind: 'country',
    code: 'AE',
    zoom: 0.9,
    name: 'United Arab Emirates',
    lat: 24,
    lon: 54,
    capital: 'Abu Dhabi',
    population: '~10M',
    area: '83.6K km²',
    summary: 'Seven emirates where futuristic skylines meet dunes and the Arabian Gulf.',
    regions: [
      r('dubai', 'Dubai', 25.2048, 55.2708, 'City of superlatives', 'Record-breaking towers, man-made islands and old souks along the creek.', DUBAI),
      r(
        'abu-dhabi',
        'Abu Dhabi',
        24.4539,
        54.3773,
        'The capital',
        'Grand mosques, museums on Saadiyat Island and mangrove coastlines.',
        landmarksOnly(
          { name: 'Sheikh Zayed Grand Mosque', area: 'Abu Dhabi', note: 'White marble mosque with 82 domes.' },
          { name: 'Louvre Abu Dhabi', area: 'Saadiyat Island', note: 'Museum beneath a vast “rain of light” dome.' },
        ),
      ),
    ],
  },
  {
    id: 'egypt',
    kind: 'country',
    code: 'EG',
    zoom: 0.6,
    name: 'Egypt',
    lat: 26.8,
    lon: 30.8,
    capital: 'Cairo',
    population: '~107M',
    area: '1.01M km²',
    summary: 'Five thousand years of civilisation along the Nile, from the pyramids to the Red Sea.',
    regions: [
      r(
        'cairo',
        'Cairo & Giza',
        30.0444,
        31.2357,
        'Home of the pyramids',
        'Africa’s largest city, beside the last standing wonder of the ancient world.',
        CAIRO,
      ),
      r('luxor', 'Luxor', 25.6872, 32.6396, 'The world’s greatest open-air museum', 'Karnak, Luxor Temple and the Valley of the Kings.'),
      r('sharm', 'Sharm El Sheikh', 27.9158, 34.33, 'Red Sea resort', 'Coral reefs, diving and the mountains of Sinai.'),
    ],
  },
  {
    id: 'turkey',
    kind: 'country',
    code: 'TR',
    zoom: 0.65,
    name: 'Türkiye',
    lat: 39,
    lon: 35,
    capital: 'Ankara',
    population: '~85M',
    area: '784K km²',
    summary: 'A bridge between Europe and Asia, with Byzantine and Ottoman treasures.',
    regions: [
      r(
        'istanbul',
        'Istanbul',
        41.0082,
        28.9784,
        'Where two continents meet',
        'Mosques, palaces and bazaars on both sides of the Bosphorus.',
        ISTANBUL,
      ),
      r('cappadocia', 'Cappadocia', 38.6431, 34.8289, 'Land of fairy chimneys', 'Rock valleys and sunrise hot-air balloon flights.'),
      r('antalya', 'Antalya', 36.8969, 30.7133, 'The Turquoise Coast', 'Mediterranean beaches and Roman ruins.'),
    ],
  },
  {
    id: 'spain',
    kind: 'country',
    code: 'ES',
    zoom: 0.75,
    name: 'Spain',
    lat: 40.4,
    lon: -3.7,
    capital: 'Madrid',
    population: '~48M',
    area: '506K km²',
    summary: 'Moorish palaces, Gaudí’s architecture and Mediterranean coastlines.',
    regions: [
      r('madrid', 'Madrid', 40.4168, -3.7038, 'The capital', 'Grand boulevards and the Prado, Reina Sofía and Thyssen museums.'),
      r(
        'barcelona',
        'Barcelona',
        41.3874,
        2.1686,
        'Gaudí’s city',
        'Modernist architecture, beaches and the Gothic Quarter.',
        BARCELONA,
      ),
      r('seville', 'Seville', 37.3891, -5.9845, 'Heart of Andalusia', 'The Alcázar palace, flamenco and orange-scented streets.'),
    ],
  },
];

export function mapSearchUrl(spot: Spot, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name}, ${city}`)}`;
}
