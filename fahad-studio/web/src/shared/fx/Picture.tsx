// Responsive image from the prepared-asset manifest (scripts/prepare-assets.mjs):
// AVIF → WebP → JPEG fallbacks, srcset per width, intrinsic size to avoid CLS,
// lazy by default (pass priority for above-the-fold images).
import React from "react";
import manifest from "../media-manifest.json";

type ImageEntry = { kind: "image"; width: number; height: number; widths: number[]; base: string; formats: string[]; color?: string };
const images = manifest.images as Record<string, ImageEntry>;

export const imageEntry = (id: string) => {
  const e = images[id];
  if (!e) throw new Error(`Unknown image "${id}" — run npm run assets`);
  return e;
};

export const imageUrl = (id: string, width?: number, format = "webp") => {
  const e = imageEntry(id);
  const w = width ? e.widths.reduce((a, b) => (Math.abs(b - width) < Math.abs(a - width) ? b : a)) : e.widths[e.widths.length - 1];
  return `${e.base}-${w}.${format}`;
};

export const Picture: React.FC<{
  id: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  imgRef?: React.Ref<HTMLImageElement>;
}> = ({ id, alt, sizes, priority = false, className, style, imgRef }) => {
  const e = imageEntry(id);
  const set = (fmt: string) => e.widths.map((w) => `${e.base}-${w}.${fmt} ${w}w`).join(", ");
  return (
    <picture className={className} style={{ backgroundColor: e.color, ...style }}>
      {e.formats.includes("avif") ? <source type="image/avif" srcSet={set("avif")} sizes={sizes} /> : null}
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        ref={imgRef}
        src={`${e.base}-${e.widths[Math.min(1, e.widths.length - 1)]}.jpg`}
        srcSet={set("jpg")}
        sizes={sizes}
        width={e.width}
        height={e.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />
    </picture>
  );
};
