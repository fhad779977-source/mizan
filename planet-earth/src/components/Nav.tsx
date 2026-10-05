import type { SectionId } from '../data/content';
import { SoundToggle } from './SoundToggle';

interface NavProps {
  active: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onNavigate: (id: SectionId) => void;
}

const LINKS: { label: string; target: SectionId; index: number[] }[] = [
  { label: 'Explore', target: 'explore', index: [1] },
  { label: 'Discover', target: 'elements', index: [2, 3] },
  { label: 'About', target: 'final', index: [4] },
];

export function Nav({ active, soundOn, onToggleSound, onNavigate }: NavProps) {
  return (
    <header className="nav">
      <a
        className="nav__brand"
        href="#hero"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('hero');
        }}
        aria-label="Planet Earth — back to orbit"
      >
        <span className="nav__mark" aria-hidden="true" />
        <span className="nav__wordmark">Planet&nbsp;Earth</span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        {LINKS.map((link, i) => (
          <span key={link.target} className="nav__item">
            {i > 0 && <span className="nav__dash" aria-hidden="true" />}
            <a
              href={`#${link.target}`}
              className={link.index.includes(active) ? 'is-current' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(link.target);
              }}
            >
              {link.label}
            </a>
          </span>
        ))}
      </nav>
      <SoundToggle on={soundOn} onToggle={onToggleSound} />
    </header>
  );
}
