import React from "react";
import { content } from "../content";

export const Footer: React.FC = () => (
  <footer className="ftr">
    {/* Decorative, incidental wordmark (WCAG 1.4.3 exception): the name is
        also given as readable text in the row below. */}
    <svg className="ftr__mark" viewBox="-4 22 682 250" aria-hidden="true" focusable="false" preserveAspectRatio="xMinYMid meet">
      <text x="0" y="262">
        {content.brand.name}
      </text>
    </svg>
    <div className="ftr__row">
      <p>
        {content.brand.name} — {content.brand.descriptor} · {content.footer.year}
      </p>
      <p className="ar" dir="rtl" lang="ar">{content.brand.arabic}</p>
      <p>{content.footer.note}</p>
      <a className="fx-link" href="#top">
        Back to top ↑
      </a>
    </div>
  </footer>
);
