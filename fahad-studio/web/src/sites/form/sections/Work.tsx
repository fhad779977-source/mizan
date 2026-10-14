// Concept projects: a scannable index (rows link to details) and editorial
// detail strips that alternate sides. Rows preview their screen on hover or
// focus; on touch the thumbnail is always visible.
import React from "react";
import { MaskHeadline } from "../../../shared/fx/MaskHeadline";
import { Parallax } from "../../../shared/fx/Parallax";
import { Picture } from "../../../shared/fx/Picture";
import { Reveal } from "../../../shared/fx/Reveal";
import { content } from "../content";
import { lines } from "../Segments";

const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

const Name: React.FC<{ name: string }> = ({ name }) => {
  // "مِداد — Midad": Arabic and Latin parts each get their own direction.
  if (!hasArabic(name)) return <>{name}</>;
  const [ar, en] = name.split(" — ");
  return (
    <>
      <span dir="rtl" className="ar-display">{ar}</span>
      {en ? <span className="name-latin"> — {en}</span> : null}
    </>
  );
};

export const Work: React.FC = () => (
  <section id="work" className="work" aria-labelledby="work-title">
    <div className="section-head">
      <p className="eyebrow mono">{content.work.eyebrow}</p>
      <MaskHeadline id="work-title" className="display" lines={lines(content.work.title)} />
      <p className="section-note">{content.work.note}</p>
    </div>
    <Reveal as="ol" className="index">
      {content.concepts.map((c) => (
        <li key={c.id} data-reveal>
          <a className="index__row" href={`#${c.id}`}>
            <span className="index__n mono">{c.number}</span>
            <span className="index__name">
              <Name name={c.name} />
            </span>
            <span className="index__disc">{c.discipline}</span>
            <span className="index__thumb" aria-hidden>
              <Picture id={c.image} alt="" sizes="160px" />
            </span>
            <span className="index__arrow" aria-hidden>
              ↘
            </span>
          </a>
        </li>
      ))}
    </Reveal>
    <div className="details">
      {content.concepts.map((c, i) => (
        <article key={c.id} id={c.id} className="detail" data-side={i % 2 ? "right" : "left"} aria-labelledby={`${c.id}-name`}>
          <div className="detail__media">
            <Parallax speed={4}>
              <Picture id={c.image} alt={`${c.name} concept interface: ${c.summary}`} sizes="(min-width: 1024px) 60vw, 92vw" className="detail__img" />
            </Parallax>
          </div>
          <Reveal className="detail__text">
            <p className="mono detail__meta" data-reveal>
              {c.number} · Concept project
            </p>
            <h3 id={`${c.id}-name`} className="detail__name" data-reveal>
              <Name name={c.name} />
            </h3>
            <p className="mono detail__disc" data-reveal>{c.discipline}</p>
            <p className="detail__summary" data-reveal>{c.summary}</p>
            <dl className="detail__specs" data-reveal>
              <div>
                <dt>Type</dt>
                <dd>{c.type}</dd>
              </div>
              <div>
                <dt>Palette</dt>
                <dd className="swatches">
                  {c.palette.map((p) => (
                    <span key={p} className="swatch" style={{ background: p }} title={p}>
                      <span className="sr-only">{p}</span>
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Motion</dt>
                <dd>{c.motion}</dd>
              </div>
            </dl>
          </Reveal>
        </article>
      ))}
    </div>
  </section>
);
