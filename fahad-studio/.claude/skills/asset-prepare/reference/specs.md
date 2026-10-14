# Media specs used by scripts/prepare-assets.mjs

Images (sharp 0.35): widths from config (never upscaled) → AVIF q52 effort 5, WebP q78, progressive mozjpeg q80; dominant colour stored as placeholder background; `<img width height>` from the source to prevent layout shift; lazy by default, `priority` for above-the-fold.

Video (FFmpeg): H.264 High, yuv420p, CRF (desktop ~20, mobile ~24), preset slow, `+faststart`, no audio; VP9 WebM (crf ~28/33, row-mt). Poster: frame at `posterAt` → 1600 px JPEG q76 + WebP q74.

Playback contract (VideoBackground): `muted playsInline loop preload="none"`, poster visible until playing, sources attached within 200 px of the viewport, paused off-screen and on hidden tab, mobile (<768 px) gets the mobile encode, Save-Data and reduced motion keep the poster, source error or 8 s stall → poster + "Play background" button.

Seamless loops from Remotion: rotate/animate by exactly one period over the composition; verify first vs last frame with `ffmpeg -lavfi psnr` (> 45 dB is visually seamless).
