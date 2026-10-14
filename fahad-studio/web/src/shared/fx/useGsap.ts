import { type DependencyList, type RefObject, useLayoutEffect } from "react";
import { gsap, trackFx } from "./motion";

/**
 * Runs GSAP code scoped to a container inside gsap.context(). On unmount (or
 * when deps change) the context is reverted: tweens, timelines and
 * ScrollTriggers created inside are killed and inline styles restored.
 */
export const useGsap = (
  scope: RefObject<HTMLElement | null>,
  build: (ctx: gsap.Context) => void | (() => void),
  deps: DependencyList,
  name = "gsap",
) => {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const release = trackFx(name);
    let extra: void | (() => void);
    const ctx = gsap.context((self) => {
      extra = build(self);
    }, scope.current);
    return () => {
      if (typeof extra === "function") extra();
      ctx.revert();
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
