// A section pinned while the user scrolls through a scrubbed timeline, with an
// explicit start (section top hits viewport top) and end (+length).
// `enabled=false` renders the static end state (mobile / reduced motion).
import React, { useRef } from "react";
import { gsap, reducedMotion, scrub } from "./motion";
import { useGsap } from "./useGsap";

export const PinnedScene: React.FC<{
  children: React.ReactNode;
  /** Scroll distance of the pinned phase, as a multiple of viewport height. */
  length?: number;
  enabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
  build: (tl: gsap.core.Timeline, root: HTMLElement) => void;
  onProgress?: (p: number) => void;
}> = ({ children, length = 2, enabled = true, className, id, label, build, onProgress }) => {
  const ref = useRef<HTMLElement>(null);
  useGsap(
    ref,
    () => {
      if (!enabled || reducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${window.innerHeight * length}`,
          pin: true,
          scrub: scrub(0.8),
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: onProgress ? (st) => onProgress(st.progress) : undefined,
        },
      });
      build(tl, ref.current!);
    },
    [enabled, length],
    "PinnedScene",
  );
  return (
    <section ref={ref} className={className} id={id} aria-label={label}>
      {children}
    </section>
  );
};
