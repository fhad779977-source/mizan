// Headline revealed line by line through masks. Lines are given explicitly
// (never split into letters), so Arabic stays joined. Inline <em> works.
import React, { useRef } from "react";
import { gsap, reducedMotion } from "./motion";
import { useGsap } from "./useGsap";

export const MaskHeadline: React.FC<{
  lines: React.ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** "load" animates on mount; "scroll" when it enters the viewport. */
  trigger?: "load" | "scroll";
  delay?: number;
  dir?: "ltr" | "rtl";
  id?: string;
}> = ({ lines, as: Tag = "h2", className, trigger = "scroll", delay = 0, dir, id }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useGsap(
    ref,
    () => {
      if (reducedMotion()) return;
      const inner = gsap.utils.toArray<HTMLElement>(".fx-mask__inner", ref.current);
      gsap.fromTo(
        inner,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.09,
          delay,
          scrollTrigger: trigger === "scroll" ? { trigger: ref.current, start: "top 85%", once: true } : undefined,
        },
      );
    },
    [trigger, delay],
    "MaskHeadline",
  );
  return (
    <Tag ref={ref} className={className} dir={dir} id={id}>
      {lines.map((line, i) => (
        <span className="fx-mask" key={i}>
          <span className="fx-mask__inner">{line}</span>
        </span>
      ))}
    </Tag>
  );
};
