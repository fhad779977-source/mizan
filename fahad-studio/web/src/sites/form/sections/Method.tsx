import React from "react";
import { MaskHeadline } from "../../../shared/fx/MaskHeadline";
import { Reveal } from "../../../shared/fx/Reveal";
import { content } from "../content";
import { lines } from "../Segments";

export const Method: React.FC = () => (
  <section id="method" className="method" aria-labelledby="method-title">
    <div className="section-head">
      <p className="eyebrow mono">{content.method.eyebrow}</p>
      <MaskHeadline id="method-title" className="display" lines={lines(content.method.title)} />
    </div>
    <Reveal as="ol" className="steps" stagger={0.12}>
      {content.method.steps.map((s) => (
        <li key={s.n} className="step" data-reveal>
          <span className="step__n">{s.n}</span>
          <h3 className="step__title">
            {s.title}
            <span className="ar step__ar" dir="rtl" lang="ar">
              {s.ar}
            </span>
          </h3>
          <p>{s.text}</p>
        </li>
      ))}
    </Reveal>
  </section>
);
