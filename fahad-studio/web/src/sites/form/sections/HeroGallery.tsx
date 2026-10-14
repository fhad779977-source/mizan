// Hero + the main pinned scroll scene. The receding shelf of concept screens
// rotates flat into a gallery wall, then the wall walks past the viewer.
// Desktop with motion: pinned + scrubbed. Otherwise: static shelf (the
// GalleryRail section then shows the screens as a swipeable row).
import React from "react";
import { MaskHeadline } from "../../../shared/fx/MaskHeadline";
import { gsap } from "../../../shared/fx/motion";
import { PerspectiveShelf, shelfPose } from "../../../shared/fx/PerspectiveShelf";
import { Picture } from "../../../shared/fx/Picture";
import { PinnedScene } from "../../../shared/fx/PinnedScene";
import { content } from "../content";
import { lines } from "../Segments";

// Shelf sits right of the headline (offset in % of a panel's width).
const HERO_POSE = { offsetX: 64, spread: 22, depth: 150, ry: -32, rx: 4 };
const STATIC_POSE = { offsetX: 32, spread: 18, depth: 110, ry: -26, rx: 4 };

export const HeroGallery: React.FC<{ pinned: boolean }> = ({ pinned }) => {
  const items = content.concepts.map((c, i) => ({
    key: c.id,
    label: `${c.number} ${c.name}, concept project`,
    node: (
      <figure className="panel">
        <Picture id={c.image} alt={`${c.name} — ${c.discipline}. Concept interface.`} sizes="(min-width: 768px) 38vw, 82vw" priority={i < 2} className="panel__img" />
        <figcaption className="panel__cap">
          <span className="mono">{c.number}</span>
          <span className="panel__name">{c.name}</span>
          <span className="mono panel__disc">{c.discipline}</span>
        </figcaption>
      </figure>
    ),
  }));

  const build = (tl: gsap.core.Timeline, root: HTMLElement) => {
    const panels = gsap.utils.toArray<HTMLElement>("[data-shelf-item]", root);
    const n = panels.length;
    const stage = root.querySelector<HTMLElement>(".fx-shelf__stage")!;
    panels.forEach((el, i) => {
      const p = shelfPose(i, n, HERO_POSE);
      gsap.set(el, { xPercent: p.x, yPercent: p.y, z: p.z, rotationY: p.ry, rotationX: p.rx });
    });
    const step = () => panels[0].offsetWidth * 1.14;
    tl.to(".hero__copy", { yPercent: -18, autoAlpha: 0, duration: 2.2, ease: "power2.in" }, 0)
      .to(panels, { xPercent: (i) => i * 114, yPercent: 0, z: 0, rotationY: 0, rotationX: 0, duration: 3.2, ease: "power3.inOut", stagger: 0.12 }, 0.4)
      .fromTo(".panel__cap", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 2.6)
      .fromTo(".hero__wall-label", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 2.8)
      .to(stage, { x: () => -(n - 1) * step(), duration: 6.4, ease: "none" }, 4)
      .fromTo(".hero__progress-bar", { scaleX: 0 }, { scaleX: 1, duration: 10.4, ease: "none" }, 0);
  };

  return (
    <PinnedScene id="top" className="hero" label="Introduction and concept gallery" enabled={pinned} length={2.8} build={build}>
      <div className="hero__copy">
        <p className="eyebrow mono">{content.hero.eyebrow}</p>
        <MaskHeadline as="h1" className="hero__title" trigger="load" delay={0.1} lines={lines(content.hero.title)} />
        <div className="hero__intro">
          <p>{content.hero.intro}</p>
          <p className="ar hero__ar" dir="rtl">{content.hero.arabic}</p>
        </div>
        {pinned ? <p className="hero__hint mono" aria-hidden>{content.hero.scrollHint} ↓</p> : null}
      </div>
      <PerspectiveShelf items={items} managed={pinned} pose={pinned ? HERO_POSE : STATIC_POSE} className={`hero__shelf ${pinned ? "is-pinned" : "is-static"}`} itemClassName="hero__panel" />
      {pinned ? (
        <>
          <p className="hero__wall-label mono" aria-hidden>
            {content.gallery.label} — {content.gallery.caption}
          </p>
          <div className="hero__progress" aria-hidden>
            <div className="hero__progress-bar" />
          </div>
        </>
      ) : null}
    </PinnedScene>
  );
};

/** Swipeable, keyboard-scrollable row used when the pinned scene is off. */
export const GalleryRail: React.FC = () => (
  <section className="rail" aria-labelledby="rail-title">
    <div className="rail__head">
      <h2 id="rail-title" className="mono">{content.gallery.label}</h2>
      <p>{content.gallery.caption}</p>
    </div>
    <div className="rail__track" tabIndex={0} role="region" aria-label="Concept screens, scroll horizontally">
      {content.concepts.map((c) => (
        <a key={c.id} href={`#${c.id}`} className="rail__item">
          <Picture id={c.image} alt={`${c.name} — concept interface`} sizes="(min-width: 768px) 44vw, 82vw" className="panel__img" />
          <span className="panel__cap">
            <span className="mono">{c.number}</span>
            <span className="panel__name">{c.name}</span>
          </span>
        </a>
      ))}
    </div>
  </section>
);
