import React, { useEffect } from "react";
import { reducedMotion, ScrollTrigger } from "../../shared/fx/motion";
import { useMedia } from "../../shared/hooks/useMedia";
import { Closing } from "./sections/Closing";
import { Footer } from "./sections/Footer";
import { Header } from "./sections/Header";
import { GalleryRail, HeroGallery } from "./sections/HeroGallery";
import { Method } from "./sections/Method";
import { Work } from "./sections/Work";

export const App: React.FC = () => {
  const wide = useMedia("(min-width: 900px) and (min-height: 560px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)") || reducedMotion();
  // One pinned scroll scene on capable screens; everyone else gets a static
  // shelf plus a swipeable rail with the same content.
  const pinned = wide && !reduce;

  // Deep links (/form/#method): the pinned scene adds scroll length after the
  // browser's initial anchor jump, so re-resolve the hash once layout is final.
  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      const target = location.hash.length > 1 ? document.querySelector(location.hash) : null;
      target?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
    });
    return () => {
      cancelled = true;
    };
  }, [pinned]);

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <Header />
      <main>
        <HeroGallery key={pinned ? "pin" : "static"} pinned={pinned} />
        {!pinned ? <GalleryRail /> : null}
        <Work />
        <Method />
        <Closing />
      </main>
      <Footer />
    </>
  );
};
