import { useState } from 'react';
import type { Place, PlaceKind } from '../data/content';

interface ExploreProps {
  active: boolean;
  places: Place[];
  selected: Place | null;
  onSelect: (place: Place | null) => void;
}

export function Explore({ active, places, selected, onSelect }: ExploreProps) {
  const [kind, setKind] = useState<PlaceKind>('continent');
  const list = places.filter((p) => p.kind === kind);

  return (
    <section id="explore" className={`section section--tall explore ${active ? 'is-active' : ''}`} aria-labelledby="explore-title">
      <div className="sticky">
        <div className="panel explore__panel">
          <p className="eyebrow reveal" style={{ ['--d' as string]: '0s' }}>
            <span>02</span> Explore Earth
          </p>
          <h2 id="explore-title" className="display reveal" style={{ ['--d' as string]: '0.1s' }}>
            Continents <em>&amp;</em> Oceans
          </h2>
          <p className="body reveal" style={{ ['--d' as string]: '0.2s' }}>
            Touch a glowing point on the globe — or choose from the list — and the planet turns to meet you.
          </p>

          <div className="tabs reveal" role="tablist" aria-label="Place type" style={{ ['--d' as string]: '0.3s' }}>
            {(['continent', 'ocean'] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                className={kind === k ? 'is-active' : undefined}
                onClick={() => {
                  setKind(k);
                  if (selected && selected.kind !== k) onSelect(null);
                }}
              >
                {k === 'continent' ? 'Continents' : 'Oceans'}
                <sup>{places.filter((p) => p.kind === k).length}</sup>
              </button>
            ))}
          </div>

          <ul className="place-list reveal" style={{ ['--d' as string]: '0.4s' }}>
            {list.map((p) => (
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
        </div>

        <article className={`place-card ${selected ? 'is-open' : ''}`} aria-live="polite">
          {selected && (
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
              <p className="place-card__coords">
                {Math.abs(selected.lat).toFixed(0)}°{selected.lat >= 0 ? 'N' : 'S'} · {Math.abs(selected.lon).toFixed(0)}°
                {selected.lon >= 0 ? 'E' : 'W'}
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
