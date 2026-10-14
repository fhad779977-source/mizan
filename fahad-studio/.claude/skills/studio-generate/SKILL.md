---
name: studio-generate
description: Generate realistic footage or images for a FAHAD STUDIO video with an external AI service (Higgsfield MCP), then bring it into the studio. Paid — always quote and get explicit approval before generating. Use for AI product films, the prompt-reel template, or any shot the studio cannot render itself.
---

# /studio-generate

The studio renders design, type, 3D and motion itself. Photoreal footage (hands, leather, real light on a real product) comes from an external generator. This skill is the bridge. **Nothing here is free: never call a generate tool without the user's explicit "yes" to a quoted cost in this conversation.**

## 1. Brief (no cost)
- Get: the product photo (user supplies it; copy to `public/assets/images/<slug>-product.<ext>`), the shot list (3–6 shots, 3–5 s each), format (9:16 for TikTok/Reels).
- Write one prompt per shot. The prompt must describe *this* product — never reuse a prompt written for another product. Reference the product image as the identity source ("@Image1 is the exact product: keep its shape, colour, stitching").
- No people unless the user asked. No invented brands, logos or claims.

## 2. Quote (no cost)
- Load the Higgsfield tools with ToolSearch (`+Higgsfield`). If the server is not connected or not signed in, stop and tell the user; do not substitute another paid service.
- Use read-only calls only: `balance`, `models_explore` (action `recommend`), quote tools where available.
- Tell the user, in Arabic: model, number of generations, cost in credits, remaining balance. Ask for approval. Stop here until they answer.

## 3. Generate (paid — only after approval)
- Upload the product photo (`media_upload` → PUT → `media_confirm`), then `generate_video` / `generate_image` (batch tools for several shots), wait with `jobs_wait`.
- Never exceed the approved count or credits. A failed/ugly result is reported, not silently regenerated.

## 4. Bring in
- Download each result to `public/assets/video/gen/<slug>-<shot>.mp4` (or images/gen/).
- Log every file in `assets-registry.json`: `source` = "Generated — Higgsfield <model>, prompt: <first 120 chars>…, job <id>", `license` = the service's terms for the user's plan (ask if unknown), `usedIn`.
- Probe with `ffprobe` (size, fps, duration) and look at frames before using.

## 5. Use
- `npm run new-project -- --template prompt-reel --slug <slug>` → set `scenes[0].media` (result film), `secondaryMedia` (product photo), `body` (the exact prompt used). For multi-shot films use `screen-recording`/`product-hero` scenes or several `prompt-reveal` scenes.
- Then the normal loop: `npm run check` → `npm run preview -- <id>` → `npm run contact-sheet -- <id>` → `npm run render -- <id>` → `npm run verify -- <file>`.
