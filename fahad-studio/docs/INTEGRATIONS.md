# Optional integrations

None of these are required; the local pipeline (Remotion + FFmpeg + synthesized audio + local fonts) works without them. `npm run doctor` detects them but never installs anything.

| Integration | Runs | Needs | Status here |
|---|---|---|---|
| Whisper transcription (whisper.cpp via `@remotion/install-whisper-cpp`) | Locally, offline | Package install + model download (tiny ≈ 75 MB … large ≈ 3 GB) + C++ build tools | Not installed. Captions today come from SRT → `npm run import-srt`. |
| OpenAI Whisper API / other cloud STT | Cloud | Account + API key, paid per minute | Not configured. |
| ElevenLabs TTS (voice-over) | Cloud | `ELEVENLABS_API_KEY`, paid | Not configured. Official guidance: `.claude/skills/remotion-markup/voiceover.md`. Generated files must be saved to `public/assets/audio/voice/` and logged in `assets-registry.json`. |
| Image / video generation (any provider) | Cloud | Account, usually paid | Not configured. Outputs must be downloaded into `public/assets` (no temporary links) and logged. |
| Blender | Locally | Blender install; export GLB to `public/assets/models` | Not installed. Load GLB with `useLoader(GLTFLoader, staticFile(...))` inside `StudioStage`. |
| After Effects | Locally (macOS/Windows) | Adobe licence | Not available (Linux). Import rendered MP4/PNG sequences or Lottie JSON (would need `@remotion/lottie`, not installed). |
| GPU WebGL | Locally | A GPU + `FAHAD_GL=angle` | This machine uses `swangle` (software). |

Rule: no paid API call, purchase, unknown MCP server or large model download without the user's explicit approval and a stated size/cost.
