// Web section index: links to every site and tool in this Vite app.
import { createRoot } from "react-dom/client";
import "../shared/styles/fonts.css";
import "../shared/styles/base.css";

const links = [
  { href: "/form/", title: "FORM — Independent Digital Atelier", note: "Proof site: pinned gallery scene, concept projects, method, horizon closing." },
  { href: "/lab/", title: "Interaction Lab", note: "Every reusable effect in isolation, with remount test." },
  { href: "/concepts/", title: "Concept screens", note: "The five original interfaces captured into assets (capture source)." },
];

createRoot(document.getElementById("root")!).render(
  <main style={{ background: "#0a0a0b", color: "#efeae0", minHeight: "100svh", padding: "clamp(24px,6vw,96px)", fontFamily: "Instrument Sans, sans-serif" }}>
    <p style={{ fontFamily: "JetBrains Mono", fontSize: 12, letterSpacing: "0.16em", color: "#8f8b84" }}>FAHAD STUDIO · WEB</p>
    <h1 style={{ fontFamily: "Instrument Serif", fontWeight: 400, fontSize: "clamp(48px,8vw,120px)", lineHeight: 0.95, margin: "16px 0 48px" }}>Sites &amp; experiments</h1>
    <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: "1px solid rgba(239,234,224,.14)" }}>
      {links.map((l) => (
        <li key={l.href} style={{ borderBottom: "1px solid rgba(239,234,224,.14)" }}>
          <a href={l.href} style={{ display: "block", padding: "22px 0", textDecoration: "none" }}>
            <span style={{ fontFamily: "Instrument Serif", fontSize: 34 }}>{l.title}</span>
            <span style={{ display: "block", color: "#b9bcc2", marginTop: 6 }}>{l.note}</span>
          </a>
        </li>
      ))}
    </ul>
  </main>,
);
