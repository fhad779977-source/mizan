import { useEffect, useRef } from 'react';
import type { Place } from '../data/content';
import type { EarthExperience } from '../three/EarthExperience';

interface HotspotsProps {
  experience: EarthExperience | null;
  places: Place[];
  selectedId: string | null;
  onSelect: (place: Place) => void;
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
    experience.onHotspots((data) => {
      for (let i = 0; i < places.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const opacity = data[i * 3 + 2];
        el.style.transform = `translate3d(${data[i * 3].toFixed(1)}px, ${data[i * 3 + 1].toFixed(1)}px, 0)`;
        el.style.opacity = opacity.toFixed(3);
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
