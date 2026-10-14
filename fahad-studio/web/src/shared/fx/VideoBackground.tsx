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

export const VideoBackground: React.FC<{ id: string; label: string; className?: string; children?: React.ReactNode }> = ({ id, label, className, children }) => {
  const e = videos[id];
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"poster" | "playing" | "blocked">("poster");

  useEffect(() => {
    const el = video.current;
    const host = wrap.current;
    if (!el || !host || !e) return;
    const release = trackFx("VideoBackground");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reducedMotion() || saveData) {
      setState("blocked");
      return release;
    }
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const src = mobile ? e.mobile : e.desktop;
    let attached = false;
    let stall = 0;
    const onError = () => setState("blocked");
    const attach = () => {
      if (attached) return;
      attached = true;
      if (src.webm) {
        const s = document.createElement("source");
        s.src = src.webm;
        s.type = "video/webm";
        el.appendChild(s);
      }
      const m = document.createElement("source");
      m.src = src.mp4;
      m.type = "video/mp4";
      // A failing last <source> means no playable source: keep the poster.
      m.addEventListener("error", onError);
      el.appendChild(m);
      el.load();
      // play() can stay pending forever on a dead network; give up after 8 s.
      stall = window.setTimeout(() => {
        if (el.readyState < 2) setState("blocked");
      }, 8000);
    };
    const play = () =>
      el.play().then(
        () => setState("playing"),
        () => setState("blocked"),
      );
    el.addEventListener("error", onError, true);
    let inView = false;
    const io = new IntersectionObserver(
      (entries) => {
        // Several entries can arrive for the same element in one batch
        // (fast scroll + layout refresh); only the newest one is current.
        const entry = entries[entries.length - 1];
        inView = entry.isIntersecting;
        if (entry.isIntersecting) {
          attach();
          void play();
        } else if (!el.paused) el.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(host);
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (inView && attached) void play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(stall);
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
      <video ref={video} className="fx-video__media" muted playsInline loop preload="none" aria-label={label} disablePictureInPicture />
      {state === "blocked" && !reducedMotion() ? (
        <button
          type="button"
          className="fx-video__play"
          onClick={() =>
            video.current?.play().then(
              () => setState("playing"),
              () => setState("blocked"),
            )
          }
        >
          Play background
        </button>
      ) : null}
      {children}
    </div>
  );
};
