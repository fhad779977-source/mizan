// Reveals a second image through a circular mask that follows the pointer.
// Touch / keyboard: a toggle button reveals the full second image instead,
// so the cursor is never required. The rAF loop runs only while active.
import React, { useEffect, useRef, useState } from "react";
import { finePointer, reducedMotion, trackFx } from "./motion";

export const CursorReveal: React.FC<{
  base: React.ReactNode;
  reveal: React.ReactNode;
  label: string;
  radius?: number;
  className?: string;
}> = ({ base, reveal, label, radius = 140, className }) => {
  const host = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const el = host.current;
    const top = layer.current;
    if (!el || !top) return;
    const release = trackFx("CursorReveal");
    if (!finePointer()) return release;
    const target = { x: 0, y: 0, r: 0 };
    const cur = { x: 0, y: 0, r: 0 };
    let raf = 0;
    const ease = reducedMotion() ? 1 : 0.18;
    const tick = () => {
      cur.x += (target.x - cur.x) * ease;
      cur.y += (target.y - cur.y) * ease;
      cur.r += (target.r - cur.r) * ease;
      top.style.clipPath = `circle(${cur.r.toFixed(1)}px at ${cur.x.toFixed(1)}px ${cur.y.toFixed(1)}px)`;
      const settled = Math.abs(target.x - cur.x) < 0.3 && Math.abs(target.y - cur.y) < 0.3 && Math.abs(target.r - cur.r) < 0.3;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      target.x = e.clientX - b.left;
      target.y = e.clientY - b.top;
      if (cur.r === 0) {
        cur.x = target.x;
        cur.y = target.y;
      }
      kick();
    };
    const enter = (e: PointerEvent) => {
      target.r = radius;
      move(e);
    };
    const leave = () => {
      target.r = 0;
      kick();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      release();
    };
  }, [radius]);

  return (
    <div ref={host} className={`fx-reveal ${className ?? ""}`} data-full={full}>
      <div className="fx-reveal__base">{base}</div>
      <div ref={layer} className="fx-reveal__top" style={full ? { clipPath: "none" } : undefined} aria-hidden={!full}>
        {reveal}
      </div>
      <button type="button" className="fx-reveal__toggle" aria-pressed={full} onClick={() => setFull((v) => !v)}>
        {full ? "Hide" : "Show"} {label}
      </button>
    </div>
  );
};
