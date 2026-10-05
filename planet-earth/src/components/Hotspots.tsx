import { useEffect, useRef } from 'react';
import type { GlobePoint } from '../data/content';
import type { EarthExperience } from '../three/EarthExperience';

interface HotspotsProps {
  experience: EarthExperience | null;
  places: GlobePoint[];
  selectedId: string | null;
  onSelect: (place: GlobePoint) => void;
}

/**
 * DOM markers pinned to the globe. Positions are written straight to the
 * elements every frame by the 3D engine, bypassing React re-renders.
 */
export function Hotspots({ experience, places, selectedId, onSelect }: HotspotsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!experience) return;
    experience.setPlaces(places);
    // Label widths, measured once; used to hide labels that would overlap.
    const widths = places.map((_, i) => refs.current[i]?.querySelector<HTMLElement>('.hotspot__label')?.offsetWidth ?? 80);
    const placed: number[] = [];
    experience.onHotspots((data) => {
      placed.length = 0;
      for (let i = 0; i < places.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const x = data[i * 3];
        const y = data[i * 3 + 1];
        const opacity = data[i * 3 + 2];
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = opacity.toFixed(3);

        // Earlier places win: a label is shown only if its box is clear of those already shown.
        let clear = opacity > 0.05;
        const left = x + 14;
        const right = left + widths[i];
        for (let k = 0; clear && k < placed.length; k += 4) {
          clear = right < placed[k] || left > placed[k + 1] || y + 10 < placed[k + 2] || y - 10 > placed[k + 3];
        }
        if (clear) placed.push(left, right, y - 10, y + 10);
        const label = clear ? 'on' : 'off';
        if (el.dataset.label !== label) el.dataset.label = label;

        const interactive = opacity > 0.35;
        if (el.dataset.live !== String(interactive)) {
          el.dataset.live = String(interactive);
          el.tabIndex = interactive ? 0 : -1;
        }
      }
    });
    return () => experience.onHotspots(null);
  }, [experience, places]);

  return (
    <div className="hotspots" aria-label="Places on the globe">
      {places.map((place, i) => (
        <button
          key={place.id}
          type="button"
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`hotspot hotspot--${place.kind} ${selectedId === place.id ? 'is-selected' : ''}`}
          onClick={() => onSelect(place)}
          aria-label={place.name}
          tabIndex={-1}
          style={{ opacity: 0 }}
        >
          <span className="hotspot__dot" aria-hidden="true" />
          <span className="hotspot__label">{place.name}</span>
        </button>
      ))}
    </div>
  );
}
