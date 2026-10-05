import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  progress: number;
  done: boolean;
  onExited: () => void;
}

export function Loader({ progress, done, onExited }: LoaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const exitedRef = useRef(onExited);
  exitedRef.current = onExited;

  // Ease the displayed percentage so it never jumps.
  useEffect(() => {
    const counter = { value: shown };
    const tween = gsap.to(counter, {
      value: progress * 100,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => setShown(counter.value),
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    if (!done || !root.current) return;
    const tl = gsap.timeline({ delay: 0.35, onComplete: () => exitedRef.current() });
    tl.to(root.current.querySelectorAll('.loader__inner > *'), {
      opacity: 0,
      y: -12,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power2.in',
    }).to(root.current, { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, '-=0.2');
    return () => {
      tl.kill();
    };
  }, [done]);

  return (
    <div className="loader" ref={root} role="status" aria-live="polite" aria-label="Loading Planet Earth">
      <div className="loader__inner">
        <div className="loader__orbit" aria-hidden="true">
          <span className="loader__planet" />
          <span className="loader__satellite" />
        </div>
        <p className="loader__brand">
          <span>Planet</span> Earth
        </p>
        <div className="loader__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${shown / 100})` }} />
        </div>
        <p className="loader__meta">
          <span>Approaching orbit</span>
          <span className="loader__pct">{String(Math.round(shown)).padStart(3, '0')}</span>
        </p>
      </div>
    </div>
  );
}
