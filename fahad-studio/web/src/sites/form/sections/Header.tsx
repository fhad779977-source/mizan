import React, { useEffect, useRef, useState } from "react";
import { content } from "../content";

export const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="hdr" data-scrolled={scrolled} data-open={open}>
      <a className="hdr__brand" href="#top" aria-label={`${content.brand.name} — back to top`}>
        {content.brand.name}
        <span className="hdr__desc">{content.brand.descriptor}</span>
      </a>
      <nav className="hdr__nav" aria-label="Primary">
        {content.nav.map((n) => (
          <a key={n.href} className="fx-link" href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <button ref={toggle} type="button" className="hdr__menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="hdr__menu-lines" />
      </button>
      <div id="mobile-nav" className="hdr__sheet" hidden={!open}>
        <nav aria-label="Mobile">
          {content.nav.map((n, i) => (
            <a key={n.href} ref={i === 0 ? firstLink : undefined} href={n.href} onClick={() => setOpen(false)}>
              <span className="hdr__sheet-n">0{i + 1}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <p className="ar" dir="rtl">{content.brand.arabic}</p>
      </div>
    </header>
  );
};
