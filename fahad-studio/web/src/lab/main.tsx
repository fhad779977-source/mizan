// Interaction Lab — every reusable effect in isolation.
// "Remount all" unmounts and remounts the demos; the live counter shows
// window.__fx.active so leaks (listeners, ScrollTriggers, rAF) are visible.
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../shared/styles/fonts.css";
import "../shared/styles/base.css";
import "../shared/styles/fx.css";
import "./lab.css";
import { CursorReveal } from "../shared/fx/CursorReveal";
import { MaskHeadline } from "../shared/fx/MaskHeadline";
import { ScrollTrigger } from "../shared/fx/motion";
import { Parallax } from "../shared/fx/Parallax";
import { PerspectiveShelf } from "../shared/fx/PerspectiveShelf";
import { Picture } from "../shared/fx/Picture";
import { PinnedScene } from "../shared/fx/PinnedScene";
import { Reveal } from "../shared/fx/Reveal";
import { VideoBackground } from "../shared/fx/VideoBackground";
import manifest from "../shared/media-manifest.json";

const Demo: React.FC<{ n: string; title: string; file: string; note: string; children: React.ReactNode }> = ({ n, title, file, note, children }) => (
  <section className="demo" aria-labelledby={`d${n}`}>
    <header className="demo__head">
      <span className="mono">{n}</span>
      <h2 id={`d${n}`}>{title}</h2>
      <code>{file}</code>
      <p>{note}</p>
    </header>
    <div className="demo__body">{children}</div>
  </section>
);

const Counter: React.FC<{ generation: number }> = ({ generation }) => {
  const [snap, setSnap] = useState("");
  useEffect(() => {
    const id = window.setInterval(() => {
      const fx = (window as Window & { __fx?: { active: Record<string, number> } }).__fx?.active ?? {};
      setSnap(`${Object.entries(fx).map(([k, v]) => `${k}:${v}`).join(" · ")} | ScrollTriggers:${ScrollTrigger.getAll().length}`);
    }, 400);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="counter mono" data-generation={generation} id="fx-counter">
      {snap}
    </p>
  );
};

const covers = ["concept-c01", "concept-c02", "concept-c03", "concept-c04", "concept-c05"];

const Demos: React.FC = () => (
  <>
    <Demo n="01" title="Mask headline" file="src/shared/fx/MaskHeadline.tsx" note="Line-by-line mask reveal. Lines are explicit — Arabic is never split into letters.">
      <MaskHeadline as="h3" className="lab-display" lines={["Composed like", <em key="e">objects.</em>]} />
      <MaskHeadline as="h3" className="lab-display ar-display" dir="rtl" lines={["نصنع حضورًا", "يُرى ويُتذكّر"]} delay={0.15} />
    </Demo>
    <Demo n="02" title="Staggered reveal" file="src/shared/fx/Reveal.tsx" note="Children marked data-reveal enter in batches as they reach the viewport.">
      <Reveal as="ul" className="lab-list">
        {["Read", "Compose", "Animate", "Deliver"].map((t, i) => (
          <li key={t} data-reveal>
            <span className="mono">0{i + 1}</span> {t}
          </li>
        ))}
      </Reveal>
    </Demo>
    <Demo n="03" title="Depth parallax" file="src/shared/fx/Parallax.tsx" note="The image drifts against the scroll inside a clipped frame. Disabled with reduced motion.">
      <div className="lab-frame">
        <Parallax speed={10}>
          <Picture id="concept-c04" alt="Meridian concept interface" sizes="(min-width: 900px) 60vw, 92vw" className="lab-img" />
        </Parallax>
      </div>
    </Demo>
    <Demo n="04" title="Pinned scene" file="src/shared/fx/PinnedScene.tsx" note="Pinned from 'top top' for 1.5 viewports; the bar shows exact start and end. Off for reduced motion.">
      <PinnedScene
        className="lab-pin"
        label="Pinned demo"
        length={1.5}
        build={(tl) => {
          tl.fromTo(".lab-pin__bar", { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0).fromTo(".lab-pin__word", { yPercent: 100 }, { yPercent: -100, duration: 1 }, 0);
        }}
      >
        <div className="lab-pin__inner">
          <span className="mono">START</span>
          <div className="lab-pin__mask">
            <span className="lab-pin__word">Pinned</span>
          </div>
          <span className="mono">END</span>
          <div className="lab-pin__track">
            <div className="lab-pin__bar" />
          </div>
        </div>
      </PinnedScene>
    </Demo>
    <Demo n="05" title="Cursor reveal" file="src/shared/fx/CursorReveal.tsx" note="A second image appears through a circle that follows the pointer. On touch or keyboard, use the toggle.">
      <CursorReveal
        className="lab-reveal"
        label="Kiln concept"
        base={<Picture id="concept-c02" alt="Herbarium concept" sizes="(min-width: 900px) 60vw, 92vw" className="lab-img" />}
        reveal={<Picture id="concept-c03" alt="Kiln concept" sizes="(min-width: 900px) 60vw, 92vw" className="lab-img" />}
      />
    </Demo>
    <Demo n="06" title="Perspective shelf" file="src/shared/fx/PerspectiveShelf.tsx" note="Covers on a receding shelf with real CSS perspective — crisp text, no WebGL.">
      <PerspectiveShelf
        className="lab-shelf"
        itemClassName="lab-shelf__item"
        pose={{ offsetX: 30, spread: 22, depth: 140, ry: -30 }}
        items={covers.map((c) => ({ key: c, label: c, node: <Picture id={c} alt="" sizes="40vw" className="lab-img lab-img--fill" /> }))}
      />
    </Demo>
    <Demo n="07" title="Video background" file="src/shared/fx/VideoBackground.tsx" note={`Replaceable by id (available: ${Object.keys(manifest.videos).join(", ")}). Poster first, lazy source, pauses off-screen, mobile encode, autoplay-blocked fallback.`}>
      <VideoBackground id="horizon" label="Planet horizon loop" decorative className="lab-video">
        <p className="lab-video__text">Poster → video, never a blank box.</p>
      </VideoBackground>
    </Demo>
    <Demo n="08" title="Hover & focus" file="src/shared/styles/fx.css" note="Underline draws from the reading edge; button fill wipes up. Every state also shows on keyboard focus.">
      <div className="lab-row">
        <a className="fx-link" href="#d08">Text link</a>
        <a className="fx-link ar" dir="rtl" href="#d08">رابط عربي</a>
        <button type="button" className="fx-button">
          Primary action <span className="fx-button__arrow" aria-hidden>→</span>
        </button>
      </div>
    </Demo>
    <Demo n="09" title="Closing scene" file="src/sites/form/sections/Closing.tsx" note="Full-bleed video, shade gradient for legibility, glass panel that keeps contrast above 4.5:1.">
      <VideoBackground id="horizon" label="Planet horizon loop" decorative className="lab-closing">
        <div className="lab-closing__shade" />
        <h3 className="lab-closing__title">
          Let’s give it <em>form.</em>
        </h3>
      </VideoBackground>
    </Demo>
  </>
);

const Lab: React.FC = () => {
  const [gen, setGen] = useState(0);
  const [mounted, setMounted] = useState(true);
  const remount = async () => {
    for (let i = 0; i < 5; i++) {
      setMounted(false);
      await new Promise((r) => setTimeout(r, 60));
      setMounted(true);
      await new Promise((r) => setTimeout(r, 60));
    }
    setGen((g) => g + 1);
    ScrollTrigger.refresh();
  };
  return (
    <main className="lab">
      <header className="lab__top">
        <p className="mono">FAHAD STUDIO · WEB</p>
        <h1>Interaction Lab</h1>
        <p>Reusable effects for the web section. One motion engine (GSAP + ScrollTrigger); CSS for hover/focus.</p>
        <div className="lab-row">
          <button type="button" className="fx-button" id="remount" onClick={remount}>
            Remount all ×5
          </button>
          <a className="fx-link" href="/">Web index</a>
        </div>
        <Counter generation={gen} />
      </header>
      {mounted ? <Demos /> : null}
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<Lab />);
