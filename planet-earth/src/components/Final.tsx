interface FinalProps {
  active: boolean;
  backend: string | null;
  onBackToOrbit: () => void;
}

export function Final({ active, backend, onBackToOrbit }: FinalProps) {
  return (
    <section id="final" className={`section final ${active ? 'is-active' : ''}`} aria-labelledby="final-title">
      <div className="final__content">
        <p className="eyebrow reveal" style={{ ['--d' as string]: '0s' }}>
          <span>05</span> About
        </p>
        <h2 id="final-title" className="final__title">
          <span className="reveal" style={{ ['--d' as string]: '0.15s' }}>
            One planet.
          </span>
          <span className="reveal" style={{ ['--d' as string]: '0.45s' }}>
            <em>Countless stories.</em>
          </span>
        </h2>
        <p className="body final__lead reveal" style={{ ['--d' as string]: '0.7s' }}>
          Every border, every journey and every story we have ever told has unfolded on this single, turning sphere.
        </p>
        <div className="reveal" style={{ ['--d' as string]: '0.85s' }}>
          <button type="button" className="btn btn--ghost" onClick={onBackToOrbit}>
            <span>Return to orbit</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </div>
      </div>
      <footer className="footer">
        <span>© Planet Earth — an interactive journey</span>
        <span>Imagery: NASA Visible Earth</span>
        <span>{backend ? `Rendered with ${backend}` : 'Rendered in CSS'}</span>
      </footer>
    </section>
  );
}
