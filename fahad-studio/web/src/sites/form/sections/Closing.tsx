// Closing scene over the horizon loop, with a transparent brief composer that
// works entirely on-device (copy to clipboard). Nothing is submitted anywhere.
import React, { useId, useMemo, useState } from "react";
import { MaskHeadline } from "../../../shared/fx/MaskHeadline";
import { VideoBackground } from "../../../shared/fx/VideoBackground";
import { content } from "../content";
import { lines } from "../Segments";

const C = content.closing;

const Brief: React.FC = () => {
  const [kind, setKind] = useState(C.brief.kinds[0]);
  const [timing, setTiming] = useState(C.brief.timings[2]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"" | "copied" | "failed">("");
  const id = useId();
  const text = useMemo(
    () => `Hello ${content.brand.name} — I am planning a ${kind.toLowerCase()} (${timing.toLowerCase()}).${note.trim() ? ` ${note.trim()}` : ""}`,
    [kind, timing, note],
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };
  const group = (label: string, options: string[], value: string, set: (v: string) => void) => (
    <fieldset className="brief__group">
      <legend className="mono">{label}</legend>
      <div className="brief__chips">
        {options.map((o) => (
          <label key={o} className="chip">
            <input type="radio" name={`${id}-${label}`} value={o} checked={value === o} onChange={() => set(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div className="brief" role="group" aria-label="Brief composer (stays on this device)">
      {group("What are you making?", C.brief.kinds, kind, setKind)}
      {group("When?", C.brief.timings, timing, setTiming)}
      <label className="brief__note">
        <span className="mono">In one sentence</span>
        <input type="text" value={note} maxLength={180} placeholder={C.brief.placeholder} onChange={(e) => setNote(e.target.value)} />
      </label>
      <p className="brief__preview" id={`${id}-preview`}>
        {text}
      </p>
      <div className="brief__actions">
        <button id={`${id}-copy`} type="button" className="fx-button" onClick={copy} aria-describedby={`${id}-preview`}>
          {C.brief.copyLabel} <span className="fx-button__arrow" aria-hidden>→</span>
        </button>
        {content.contact.email ? (
          <a className="fx-link" href={`mailto:${content.contact.email}?subject=${encodeURIComponent("Brief")}&body=${encodeURIComponent(text)}`}>
            {content.contact.email}
          </a>
        ) : null}
        <p className="brief__status" role="status" aria-live="polite">
          {status === "copied" ? C.brief.copied : status === "failed" ? C.brief.copyFailed : ""}
        </p>
      </div>
    </div>
  );
};

export const Closing: React.FC = () => (
  <section id={C.id} className="closing" aria-labelledby="closing-title">
    <VideoBackground id={C.video} label={C.videoLabel} decorative className="closing__bg">
      <div className="closing__shade" aria-hidden />
    </VideoBackground>
    <div className="closing__content">
      <MaskHeadline id="closing-title" className="closing__title" lines={lines(C.title)} />
      <p className="closing__text">{C.text}</p>
      <Brief />
    </div>
  </section>
);
