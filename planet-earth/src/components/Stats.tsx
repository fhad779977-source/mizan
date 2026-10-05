import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { STATS } from '../data/content';

interface StatsProps {
  active: boolean;
}

export function Stats({ active }: StatsProps) {
  const numbers = useRef<(HTMLSpanElement | null)[]>([]);
  const played = useRef(false);

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;
    const tweens = STATS.map((stat, i) => {
      const el = numbers.current[i];
      if (!el) return null;
      const counter = { v: 0 };
      return gsap.to(counter, {
        v: stat.value,
        duration: 2.2,
        delay: 0.25 + i * 0.12,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = counter.v.toFixed(stat.decimals);
        },
      });
    });
    return () => tweens.forEach((t) => t?.progress(1));
  }, [active]);

  return (
    <section id="stats" className={`section stats ${active ? 'is-active' : ''}`} aria-labelledby="stats-title">
      <div className="stats__inner">
        <header className="stats__header">
          <p className="eyebrow reveal" style={{ ['--d' as string]: '0s' }}>
            <span>04</span> Earth Statistics
          </p>
          <h2 id="stats-title" className="display reveal" style={{ ['--d' as string]: '0.1s' }}>
            A world, <em>measured</em>.
          </h2>
        </header>
        <ul className="stats__grid">
          {STATS.map((stat, i) => (
            <li key={stat.label} className="stat reveal" style={{ ['--d' as string]: `${0.2 + i * 0.1}s` }}>
              <p className="stat__value">
                <span
                  ref={(el) => {
                    numbers.current[i] = el;
                  }}
                >
                  {stat.value.toFixed(stat.decimals)}
                </span>
                {stat.unit && <small>{stat.unit}</small>}
              </p>
              <p className="stat__label">{stat.label}</p>
              <p className="stat__note">{stat.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
