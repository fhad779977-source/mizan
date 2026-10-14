// Replaceable background video. Sources come from the media manifest, so a
// new clip is swapped by changing an id in content data.
// - muted + playsInline + loop; poster shows before load and on any failure
// - src is attached only near the viewport (lazy); paused when off-screen
// - mobile gets the lighter encode; Save-Data / reduced motion keep the poster
// - autoplay rejection is caught and leaves the poster with a play control
import React, { useEffect, useRef, useState } from "react";
import manifest from "../media-manifest.json";
import { reducedMotion, trackFx } from "./motion";

type VideoEntry = { kind: "video"; width: number; height: number; poster: string; posterWebp: string; desktop: { mp4: string; webm?: string }; mobile: { mp4: string; webm?: string } };
const videos = manifest.videos as Record<string, VideoEntry>;

export const VideoBackground: React.FC<{
  id: string;
  label: string;
  /** Muted ambient footage that carries no information: hidden from assistive tech. */
  decorative?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ id, label, decorative = false, className, children }) => {
  const e = videos[id];
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"poster" | "playing" | "blocked">("poster");
  // Set by the effect: attaches sources (if needed) and plays. Used by the
  // play button, so reduced-motion / Save-Data viewers can opt in.
  const start = useRef<() => void>(() => {});

  useEffect(() => {
    const el = video.current;
    const host = wrap.current;
    if (!el || !host || !e) return;
    const release = trackFx("VideoBackground");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // Reduced motion and Save-Data: no autoplay and no download until asked.
    const auto = !reducedMotion() && !saveData;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const src = mobile ? e.mobile : e.desktop;
    let attached = false;
    let inView = false;
    let stall = 0;
    const onError = () => setState("blocked");
    // iOS only autoplays inline video that is muted *as an attribute*; React
    // sets the property, not the attribute, so set both explicitly.
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    const attach = () => {
      if (attached) return;
      attached = true;
      // MP4 (H.264) first: plays everywhere, including iPhone Safari; WebM is
      // a smaller fallback for browsers that skip the MP4.
      const m = document.createElement("source");
      m.src = src.mp4;
      m.type = "video/mp4";
      el.appendChild(m);
      if (src.webm) {
        const w = document.createElement("source");
        w.src = src.webm;
        w.type = "video/webm";
        el.appendChild(w);
      }
      // A failing last <source> means no playable source: keep the poster.
      el.lastElementChild?.addEventListener("error", onError);
      el.load();
      // play() can stay pending forever on a dead network; give up after 8 s.
      stall = window.setTimeout(() => {
        if (el.readyState < 2) setState("blocked");
      }, 8000);
    };
    // If autoplay is refused (e.g. iPhone Low Power Mode), the first tap,
    // click or key press anywhere on the page counts as permission.
    const removeGesture = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchend", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    const play = (): Promise<void> =>
      el.play().then(
        () => {
          removeGesture();
          setState("playing");
        },
        () => {
          setState("blocked");
          if (!auto) return;
          window.addEventListener("pointerdown", onGesture, { passive: true });
          window.addEventListener("touchend", onGesture, { passive: true });
          window.addEventListener("keydown", onGesture);
        },
      );
    function onGesture() {
      removeGesture();
      if (inView && attached) void play();
    }
    start.current = () => {
      attach();
      void play();
    };
    el.addEventListener("error", onError, true);
    if (!auto) setState("blocked");
    const io = new IntersectionObserver(
      (entries) => {
        // Several entries can arrive for the same element in one batch
        // (fast scroll + layout refresh); only the newest one is current.
        const entry = entries[entries.length - 1];
        inView = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (auto) {
            attach();
            void play();
          }
        } else if (!el.paused) el.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(host);
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (inView && attached && auto) void play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(stall);
      removeGesture();
      start.current = () => {};
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("error", onError, true);
      el.pause();
      el.removeAttribute("src");
      el.innerHTML = "";
      el.load();
      release();
    };
  }, [e]);

  if (!e) return null;
  return (
    <div ref={wrap} className={`fx-video ${className ?? ""}`} data-state={state}>
      <picture className="fx-video__poster" aria-hidden="true">
        <source type="image/webp" srcSet={e.posterWebp} />
        <img src={e.poster} alt="" width={e.width} height={e.height} loading="lazy" decoding="async" />
      </picture>
      <video
        ref={video}
        className="fx-video__media"
        muted
        playsInline
        loop
        preload="none"
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        tabIndex={-1}
        disablePictureInPicture
      />
      {/* Overlays (shades, captions) sit under the play control so it stays tappable. */}
      {children}
      {state === "blocked" ? (
        <button type="button" className="fx-video__play" onClick={() => start.current()}>
          Play background
        </button>
      ) : null}
    </div>
  );
};
