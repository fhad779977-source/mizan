import { SECTIONS, type SectionId } from '../data/content';

interface SectionRailProps {
  active: number;
  onNavigate: (id: SectionId) => void;
}

export function SectionRail({ active, onNavigate }: SectionRailProps) {
  return (
    <nav className="rail" aria-label="Sections">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          className={`rail__item ${i === active ? 'is-active' : ''}`}
          onClick={() => onNavigate(s.id)}
          aria-label={`Go to ${s.label}`}
          aria-current={i === active ? 'step' : undefined}
        >
          <span className="rail__num">{String(i + 1).padStart(2, '0')}</span>
          <span className="rail__line" />
          <span className="rail__label">{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
