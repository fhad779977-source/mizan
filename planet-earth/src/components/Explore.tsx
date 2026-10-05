import { useState } from 'react';
import type { Place } from '../data/content';
import { COUNTRIES, mapSearchUrl, type CityGuide, type Country, type Region } from '../data/countries';

export type ExploreTab = 'continent' | 'ocean' | 'country';

interface ExploreProps {
  active: boolean;
  tab: ExploreTab;
  onTab: (tab: ExploreTab) => void;
  places: Place[];
  selected: Place | null;
  onSelect: (place: Place | null) => void;
  country: Country | null;
  region: Region | null;
  onSelectCountry: (country: Country | null) => void;
  onSelectRegion: (region: Region | null) => void;
}

const TABS: { id: ExploreTab; label: string }[] = [
  { id: 'continent', label: 'Continents' },
  { id: 'ocean', label: 'Oceans' },
  { id: 'country', label: 'Countries' },
];

export function Explore(props: ExploreProps) {
  const { active, tab, onTab, places, selected, onSelect, country, region, onSelectCountry, onSelectRegion } = props;
  const drilled = tab === 'country' && country !== null;
  const counts: Record<ExploreTab, number> = {
    continent: places.filter((p) => p.kind === 'continent').length,
    ocean: places.filter((p) => p.kind === 'ocean').length,
    country: COUNTRIES.length,
  };

  return (
    <section id="explore" className={`section section--tall explore ${active ? 'is-active' : ''}`} aria-labelledby="explore-title">
      <div className="sticky">
        <div className={`panel explore__panel ${drilled ? 'is-drilled' : ''}`}>
          <p className="eyebrow reveal" style={{ ['--d' as string]: '0s' }}>
            <span>02</span> Explore Earth
          </p>
          {!drilled && (
            <>
              <h2 id="explore-title" className="display reveal" style={{ ['--d' as string]: '0.1s' }}>
                {tab === 'country' ? (
                  <>
                    Countries <em>&amp;</em> Cities
                  </>
                ) : (
                  <>
                    Continents <em>&amp;</em> Oceans
                  </>
                )}
              </h2>
              <p className="body reveal" style={{ ['--d' as string]: '0.2s' }}>
                {tab === 'country'
                  ? 'Choose a country to fly in, then open a city for its landmarks, cafés and restaurants.'
                  : 'Touch a glowing point on the globe or choose from the list, and the planet turns to meet you.'}
              </p>
            </>
          )}

          <div className="tabs reveal" role="tablist" aria-label="Place type" style={{ ['--d' as string]: '0.3s' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? 'is-active' : undefined}
                onClick={() => onTab(t.id)}
              >
                {t.label}
                <sup>{counts[t.id]}</sup>
              </button>
            ))}
          </div>

          <div className="reveal" style={{ ['--d' as string]: '0.4s' }}>
            {tab !== 'country' && (
              <ul className="place-list">
                {places
                  .filter((p) => p.kind === tab)
                  .map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={selected?.id === p.id ? 'is-active' : undefined}
                        onClick={() => onSelect(selected?.id === p.id ? null : p)}
                        aria-pressed={selected?.id === p.id}
                      >
                        <span className={`place-list__dot place-list__dot--${p.kind}`} aria-hidden="true" />
                        {p.name}
                      </button>
                    </li>
                  ))}
              </ul>
            )}

            {tab === 'country' && !country && (
              <ul className="place-list">
                {COUNTRIES.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => onSelectCountry(c)}>
                      <span className="code-chip" aria-hidden="true">
                        {c.code}
                      </span>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {country && tab === 'country' && !region && (
              <CountryView country={country} onBack={() => onSelectCountry(null)} onSelectRegion={onSelectRegion} />
            )}

            {country && tab === 'country' && region && (
              <RegionView key={region.id} country={country} region={region} onBack={() => onSelectRegion(null)} />
            )}
          </div>
        </div>

        <article className={`place-card ${selected && tab !== 'country' ? 'is-open' : ''}`} aria-live="polite">
          {selected && tab !== 'country' && (
            <div key={selected.id} className="place-card__inner">
              <header>
                <p className="eyebrow">{selected.kind === 'continent' ? 'Continent' : 'Ocean'}</p>
                <button type="button" className="place-card__close" onClick={() => onSelect(null)} aria-label="Close">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </header>
              <h3>{selected.name}</h3>
              <p className="body">{selected.description}</p>
              <dl>
                {selected.stats.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="place-card__coords">{formatCoords(selected.lat, selected.lon)}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function formatCoords(lat: number, lon: number) {
  return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="back" onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {label}
    </button>
  );
}

function CountryView({
  country,
  onBack,
  onSelectRegion,
}: {
  country: Country;
  onBack: () => void;
  onSelectRegion: (region: Region) => void;
}) {
  return (
    <div className="drill">
      <BackButton label="All countries" onClick={onBack} />
      <h3 className="drill__title" id="explore-title">
        {country.name}
      </h3>
      <p className="body drill__lead">{country.summary}</p>
      <dl className="facts">
        <div>
          <dt>Capital</dt>
          <dd>{country.capital}</dd>
        </div>
        <div>
          <dt>Population</dt>
          <dd>{country.population}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{country.area}</dd>
        </div>
      </dl>
      <p className="drill__label">Cities &amp; regions</p>
      <ul className="region-list">
        {country.regions.map((rg) => (
          <li key={rg.id}>
            <button type="button" onClick={() => onSelectRegion(rg)}>
              <span className="region-list__name">
                {rg.name}
                {rg.guide && <span className="region-list__badge">Guide</span>}
              </span>
              <span className="region-list__tag">{rg.tagline}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type GuideTab = keyof CityGuide;
const GUIDE_TABS: { id: GuideTab; label: string }[] = [
  { id: 'landmarks', label: 'Landmarks' },
  { id: 'cafes', label: 'Cafés' },
  { id: 'restaurants', label: 'Restaurants' },
];

function RegionView({ country, region, onBack }: { country: Country; region: Region; onBack: () => void }) {
  const guide = region.guide;
  const available = guide ? GUIDE_TABS.filter((t) => guide[t.id].length > 0) : [];
  const [guideTab, setGuideTab] = useState<GuideTab>(available[0]?.id ?? 'landmarks');
  const spots = guide ? guide[guideTab] : [];

  return (
    <div className="drill">
      <BackButton label={country.name} onClick={onBack} />
      <p className="drill__kicker">{region.tagline}</p>
      <h3 className="drill__title" id="explore-title">
        {region.name}
      </h3>
      <p className="body drill__lead">{region.description}</p>
      <p className="drill__coords">{formatCoords(region.lat, region.lon)}</p>

      {guide && available.length > 0 && (
        <>
          <div className="guide-tabs" role="tablist" aria-label={`${region.name} guide`}>
            {available.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={guideTab === t.id}
                className={guideTab === t.id ? 'is-active' : undefined}
                onClick={() => setGuideTab(t.id)}
              >
                {t.label}
                <sup>{guide[t.id].length}</sup>
              </button>
            ))}
          </div>
          <ol className="spots" key={guideTab}>
            {spots.map((spot, i) => (
              <li key={spot.name} className="spot" style={{ ['--i' as string]: i }}>
                <span className="spot__num">{String(i + 1).padStart(2, '0')}</span>
                <div className="spot__body">
                  <p className="spot__name">{spot.name}</p>
                  <p className="spot__area">{spot.area}</p>
                  <p className="spot__note">{spot.note}</p>
                </div>
                <a
                  className="spot__map"
                  href={mapSearchUrl(spot, region.name)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${spot.name} in Google Maps`}
                >
                  Map
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 16L16 8M9 8h7v7" />
                  </svg>
                </a>
              </li>
            ))}
          </ol>
          {guideTab !== 'landmarks' && (
            <p className="spots__note">Curated picks. Open one on the map for live ratings, hours and directions.</p>
          )}
        </>
      )}
      {!guide && <p className="spots__note">A detailed city guide for {region.name} is coming soon.</p>}
    </div>
  );
}
