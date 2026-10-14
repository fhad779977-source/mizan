// FORM — all editable content lives here: copy, navigation, concept
// projects (image ids from assets.config.json), method, closing, contact.
// Sections read this file; no copy is hard-coded in components.

export type Segment = { text: string; italic?: boolean };

export type Concept = {
  id: string;
  image: string; // media-manifest image id
  number: string;
  name: string;
  discipline: string;
  summary: string;
  type: string;
  palette: string[];
  motion: string;
};

export const content = {
  brand: { name: "FORM", descriptor: "Independent Digital Atelier", arabic: "أتيليه رقمي مستقل" },
  nav: [
    { label: "Work", href: "#work" },
    { label: "Method", href: "#method" },
    { label: "Atelier", href: "#atelier" },
  ],
  hero: {
    eyebrow: "Independent Digital Atelier",
    title: [[{ text: "Interfaces," }], [{ text: "composed" }], [{ text: "like " }, { text: "objects.", italic: true }]] as Segment[][],
    intro: "FORM designs and builds websites where type, image and motion are arranged with the care of a physical object.",
    arabic: "نصمّم واجهات رقمية تُصاغ بعناية الأشياء الملموسة.",
    scrollHint: "Scroll to walk the gallery",
  },
  gallery: {
    label: "The gallery",
    caption: "Five concept interfaces, each with its own typeface, palette and motion idea.",
  },
  work: {
    eyebrow: "Concept Projects",
    title: [[{ text: "Self-initiated" }], [{ text: "studies in " }, { text: "form", italic: true }]] as Segment[][],
    note: "These are concept projects made by the atelier to explore a direction. No clients, no commissions, no results to report — only the work.",
  },
  concepts: [
    {
      id: "c01",
      image: "concept-c01",
      number: "01",
      name: "Nocturne",
      discipline: "Listening room · Web app",
      summary: "A late-night record room where the album title is the interface. The record slides out of its sleeve as playback starts.",
      type: "Instrument Serif / Instrument Sans / JetBrains Mono",
      palette: ["#0B0A09", "#EDE6DA", "#FF6A2B"],
      motion: "Sleeve-to-record slide on play; waveform scrubs with the cursor.",
    },
    {
      id: "c02",
      image: "concept-c02",
      number: "02",
      name: "Herbarium",
      discipline: "Editorial archive · Website",
      summary: "An archive of pressed plants treated like a printed journal: paper tones, specimen plates and a quiet index.",
      type: "Instrument Serif italic for names, Sans for notes",
      palette: ["#EEE7D8", "#1F2A1E", "#9C3B22"],
      motion: "Plates settle into a staggered grid; specimens draw their stems on scroll.",
    },
    {
      id: "c03",
      image: "concept-c03",
      number: "03",
      name: "Kiln",
      discipline: "Ceramics shop · E-commerce",
      summary: "A small-edition ceramics shop in fired-clay colour. Editions replace prices on the first screen.",
      type: "Instrument Sans at -5.5% tracking",
      palette: ["#B65A35", "#F3E9DC", "#2A140C"],
      motion: "Vessels rise from a warm field; edition numbers count on hover.",
    },
    {
      id: "c04",
      image: "concept-c04",
      number: "04",
      name: "Meridian",
      discipline: "Ocean conditions · Dashboard",
      summary: "A calm data surface for sea conditions: one big number, a contour field and honest sample data.",
      type: "Instrument Sans numerals, JetBrains Mono labels",
      palette: ["#07162B", "#D8E4F2", "#59E1C7"],
      motion: "Charts trace in on load; contours drift with time of day.",
    },
    {
      id: "c05",
      image: "concept-c05",
      number: "05",
      name: "مِداد — Midad",
      discipline: "Arabic type foundry · Specimen",
      summary: "A right-to-left specimen for an Arabic display face: whole words at 300 pt, a glyph table and a weight ladder.",
      type: "Noto Kufi Arabic display, IBM Plex Sans Arabic text",
      palette: ["#F4F1EA", "#111111", "#D2321E"],
      motion: "Words reveal line by line through masks — letters are never split.",
    },
  ] as Concept[],
  method: {
    eyebrow: "Method",
    title: [[{ text: "Four moves," }], [{ text: "always in " }, { text: "order", italic: true }]] as Segment[][],
    steps: [
      { n: "01", title: "Read", ar: "نقرأ", text: "One page of brief: the message, the audience and the single image the site must leave behind." },
      { n: "02", title: "Compose", ar: "نصوغ", text: "Type, grid and the key visual are fixed as still frames first. If the still is weak, nothing moves yet." },
      { n: "03", title: "Animate", ar: "نحرّك", text: "Motion is added where it explains or gives depth — scroll scenes, reveals, quiet hovers. Reduced motion is designed, not removed." },
      { n: "04", title: "Deliver", ar: "نسلّم", text: "Tested at phone, tablet and desktop widths, measured for weight, and shown in a short film made from the real site." },
    ],
  },
  closing: {
    id: "atelier",
    video: "horizon",
    videoLabel: "A dark planet horizon with a thin band of blue light, looping slowly.",
    title: [[{ text: "Let’s give it" }], [{ text: "form.", italic: true }]] as Segment[][],
    text: "Draft a short brief below. It stays on your device — copy it and send it however you prefer.",
    brief: {
      kinds: ["Website", "Product launch", "Identity in motion", "Interface prototype"],
      timings: ["This month", "Next quarter", "Still exploring"],
      placeholder: "One sentence about what you are making…",
      copyLabel: "Copy brief",
      copied: "Copied. Nothing was sent — paste it into your message.",
      copyFailed: "Copy is blocked here — select the text below instead.",
    },
  },
  // Optional. Leave null to hide; never filled with invented details.
  contact: { email: null as string | null, location: null as string | null },
  footer: { note: "A concept site built in FAHAD STUDIO.", year: "2026" },
};
