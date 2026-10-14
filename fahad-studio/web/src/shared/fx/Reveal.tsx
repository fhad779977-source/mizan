// Staggered entrance for any children marked with data-reveal.
import React, { useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger } from "./motion";
import { useGsap } from "./useGsap";

export const Reveal: React.FC<{ children: React.ReactNode; className?: string; stagger?: number; y?: number; as?: "div" | "ul" | "ol" | "section" }> = ({
  children,
  className,
  stagger = 0.08,
  y = 28,
  as: Tag = "div",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    ref,
    () => {
      if (reducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
      // Opacity only (not visibility): hidden items stay focusable, and
      // focusing one scrolls it into view, which triggers its reveal.
      gsap.set(items, { opacity: 0, y });
      ScrollTrigger.batch(items, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger }),
      });
    },
    [stagger, y],
    "Reveal",
  );
  return React.createElement(Tag, { ref, className }, children);
};
