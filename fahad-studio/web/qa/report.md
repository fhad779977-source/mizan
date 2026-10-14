# Web QA report

Generated 2026-10-14T10:15:44.624Z — 48 passed, 0 failed.

## Conditions
- browser: Playwright Chromium (headless, software GL)
- machine: cloud container, 4 vCPU, no GPU
- server: vite preview (dist/, no CDN, no HTTP compression beyond Vite defaults)
- throttledRun: CPU ×4, 150 ms latency, 1.6 Mbps down / 750 kbps up (simulated)

## Checks
- PASS /form/ @390: no console errors
- PASS /form/ @390: no missing files
- PASS /form/ @390: no horizontal overflow
- PASS /lab/ @390: no console errors
- PASS /lab/ @390: no missing files
- PASS /lab/ @390: no horizontal overflow
- PASS / @390: no console errors
- PASS / @390: no missing files
- PASS / @390: no horizontal overflow
- PASS /form/ @768: no console errors
- PASS /form/ @768: no missing files
- PASS /form/ @768: no horizontal overflow
- PASS /lab/ @768: no console errors
- PASS /lab/ @768: no missing files
- PASS /lab/ @768: no horizontal overflow
- PASS / @768: no console errors
- PASS / @768: no missing files
- PASS / @768: no horizontal overflow
- PASS /form/ @1440: no console errors
- PASS /form/ @1440: no missing files
- PASS /form/ @1440: no horizontal overflow
- PASS /lab/ @1440: no console errors
- PASS /lab/ @1440: no missing files
- PASS /lab/ @1440: no horizontal overflow
- PASS / @1440: no console errors
- PASS / @1440: no missing files
- PASS / @1440: no horizontal overflow
- PASS keyboard: skip link is the first stop — Skip to work
- PASS keyboard: all concept rows in the work index are reachable — 5 of 5 reached
- PASS keyboard: every focused element shows a focus ring
- PASS navigation: deep link /form/#method lands on the section — section top 80px
- PASS navigation: header link scrolls to #work — section top 80px
- PASS navigation: all in-page links have targets
- PASS touch: menu opens on tap and closes with Escape (focus returns) — open=true closed=true focusBack=true
- PASS touch: menu link navigates to #work — top 80px
- PASS touch: gallery rail is horizontally swipeable on mobile
- PASS reduced motion: no pinned scene, rail shown instead — {"pins":0,"rail":true,"titleOpacity":"none"}
- PASS reduced motion: headline not offset (no entrance transform) — none
- PASS reduced motion: background video not downloaded, poster shown — videoRequests=0 poster=true
- PASS video: not requested at top of page (lazy) — requests at load: 0
- PASS video: plays when the closing scene is in view — {"paused":false,"state":"playing","src":"horizon-desktop.webm"}
- PASS video: pauses when scrolled out of view
- PASS video: mobile receives the lighter encode — horizon-mobile.webm
- PASS video: failed load keeps the poster and offers play — {"state":"blocked","poster":true,"button":true}
- PASS leaks: lab effects identical after 5 remounts — {"fx":{"MaskHeadline":2,"Reveal":1,"Parallax":1,"PinnedScene":1,"CursorReveal":1,"VideoBackground":2},"triggers":8} → {"fx":{"MaskHeadline":2,"Reveal":1,"Parallax":1,"PinnedScene":1,"CursorReveal":1,"VideoBackground":2},"triggers":8}
- PASS leaks: FORM effects identical after crossing the pin breakpoint 4× — {"fx":{"MaskHeadline":4,"PinnedScene":1,"Reveal":7,"Parallax":5,"VideoBackground":1},"triggers":43,"pins":1} → {"fx":{"MaskHeadline":4,"PinnedScene":1,"Reveal":7,"Parallax":5,"VideoBackground":1},"triggers":43,"pins":1}
- PASS weight: initial mobile transfer under 1.2 MB — 406 KB
- PASS stability: CLS under 0.1 (mobile, throttled) — 0.0006

## Performance (lab)
- desktop unthrottled @1440: LCP 536 ms · CLS 0.0001 · 22 requests · 406 KB initial · load event 114 ms
- mobile throttled @390: LCP 2304 ms · CLS 0.0006 · 22 requests · 406 KB initial · load event 1320 ms
- idle requestAnimationFrame calls/s on FORM: 64

Screenshots: qa/*.png
