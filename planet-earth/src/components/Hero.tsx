interface HeroProps {
  active: boolean;
  ready: boolean;
  onStart: () => void;
}

export function Hero({ active, ready, onStart }: HeroProps) {
  return (
    <section id="hero" className={`section hero ${active && ready ? 'is-active' : ''}`} aria-label="Planet Earth">
      <div className="hero__content">
        <p className="hero__kicker reveal" style={{ ['--d' as string]: '0.1s' }}>
          Planet
        </p>
        <h1 className="hero__title reveal" style={{ ['--d' as string]: '0.25s' }}>
          {'EARTH'.split('').map((ch, i) => (
            <span key={i} style={{ ['--i' as string]: i }}>
              {ch}
            </span>
          ))}
        </h1>
        <p className="hero__lead reveal" style={{ ['--d' as string]: '0.7s' }}>
          A pale blue world suspended in the dark. Descend from orbit and explore the continents, oceans and thin
          bright air that make our only home.
        </p>
        <div className="reveal" style={{ ['--d' as string]: '0.9s' }}>
          <button type="button" className="btn" onClick={onStart}>
            <span>Start Exploring</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="hero__scroll reveal" style={{ ['--d' as string]: '1.3s' }} aria-hidden="true">
        <span>Scroll to descend</span>
        <i />
      </div>
    </section>
  );
}
