// Light depth: the element drifts against the scroll. Off for reduced motion.
import React, { useRef } from "react";
import { gsap, reducedMotion, scrub } from "./motion";
import { useGsap } from "./useGsap";

export const Parallax: React.FC<{ children: React.ReactNode; speed?: number; className?: string }> = ({ children, speed = 12, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    ref,
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { yPercent: speed / 2 },
        { yPercent: -speed / 2, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: scrub(0.4) } },
      );
    },
    [speed],
    "Parallax",
  );
  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
};
