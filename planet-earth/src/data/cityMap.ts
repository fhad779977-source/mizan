/** Shape of public/cities/<id>.json, produced by scripts/build-city-maps.mjs. */

export type PoiCategory = 'heritage' | 'landmark' | 'cafe' | 'restaurant' | 'hotel' | 'tower' | 'office' | 'mall';

export interface CityPoi {
  name: string;
  /** Name in the local script (e.g. Arabic) when OpenStreetMap has one. */
  local?: string;
  cat: PoiCategory;
  lat: number;
  lon: number;
  note?: string;
  area?: string;
  /** OpenStreetMap element, e.g. "way/123". */
  osm: string;
}

export interface CityRoad {
  name: string;
  local?: string;
  /** Polylines of [lon, lat]. */
  lines: [number, number][][];
}

export interface CityDistrict {
  name: string;
  local?: string;
  lat: number;
  lon: number;
}

export interface CityMapData {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  /** [west, south, east, north] */
  bbox: [number, number, number, number];
  roads: CityRoad[];
  districts: CityDistrict[];
  pois: CityPoi[];
  attribution: string;
}

export const CATEGORY_META: Record<PoiCategory, { label: string; plural: string }> = {
  heritage: { label: 'Heritage site', plural: 'Heritage' },
  landmark: { label: 'Landmark', plural: 'Landmarks' },
  cafe: { label: 'Café', plural: 'Cafés' },
  restaurant: { label: 'Restaurant', plural: 'Restaurants' },
  hotel: { label: 'Hotel', plural: 'Hotels' },
  tower: { label: 'Tower', plural: 'Towers' },
  office: { label: 'Institution', plural: 'Offices' },
  mall: { label: 'Shopping', plural: 'Malls' },
};

export const CATEGORY_ORDER: PoiCategory[] = ['heritage', 'landmark', 'cafe', 'restaurant', 'hotel', 'tower', 'office', 'mall'];

const cache = new Map<string, Promise<CityMapData | null>>();

/** Loads a city map once; resolves to null when the city has no map. */
export function loadCityMap(id: string): Promise<CityMapData | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}cities/${id}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<CityMapData>) : null))
      .catch(() => null);
    cache.set(id, p);
  }
  return p;
}
