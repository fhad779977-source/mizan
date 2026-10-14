import React from "react";
import { content } from "../content";

export const Footer: React.FC = () => (
  <footer className="ftr">
    <div className="ftr__mark" aria-hidden>
      {content.brand.name}
    </div>
    <div className="ftr__row">
      <p>
        {content.brand.name} — {content.brand.descriptor} · {content.footer.year}
      </p>
      <p className="ar" dir="rtl">{content.brand.arabic}</p>
      <p>{content.footer.note}</p>
      <a className="fx-link" href="#top">
        Back to top ↑
      </a>
    </div>
  </footer>
);
