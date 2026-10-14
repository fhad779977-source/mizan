# Motion rules for live sites

- Live sites run on real time and input. Remotion's frame-only rule applies to video export, not here — but capture mode (`?capture=1`) pauses the GSAP global timeline so screenshots/showreels are deterministic.
- One engine per site. Never let GSAP and CSS transitions (or two libraries) drive the same property. CSS is for hover/focus only.
- Every effect: created in `useGsap` (gsap.context → revert) or in an effect that removes listeners, disconnects observers and cancels rAF. Register with `trackFx` so the lab/QA can see leaks.
- `prefers-reduced-motion`: no pin, no parallax, no autoplay video; content shown in its final state. Design the reduced version, don't just delete motion.
- Touch: anything hover-driven needs a tap/keyboard alternative (see CursorReveal toggle, index thumbnails always visible on `hover: none`).
- Keep native scrolling (no scroll hijacking), visible focus, skip link, real anchors. Hidden-until-revealed content uses opacity, never `visibility`/`display`, so it stays focusable.
- Pinned scenes: explicit start (`top top`) and end (`+=N×viewport`), `invalidateOnRefresh`, and a static alternative for narrow/short screens.
- Video: poster first, attach src near the viewport, pause off-screen and on hidden tab, mobile encode, catch autoplay rejection and source errors.
