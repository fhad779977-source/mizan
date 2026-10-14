// Covers / screens arranged on a receding shelf with real CSS perspective.
// Purely presentational: the transform of each item is set from `pose`, so a
// pinned scroll timeline (or nothing, for static states) can drive it.
import React from "react";

export type ShelfPose = { x: number; y: number; z: number; ry: number; rx: number; scale: number };

export type ShelfOptions = { offsetX?: number; spread?: number; depth?: number; ry?: number; rx?: number };

/** Receding shelf pose for item i of n: item 0 in front, the rest stepping
 *  back like books on a shelf (x/y in % of item size, z in px). */
export const shelfPose = (i: number, n: number, o: ShelfOptions = {}): ShelfPose => {
  const { offsetX = 0, spread = 24, depth = 150, ry = -30, rx = 4 } = o;
  const t = i - (n - 1) / 2;
  return { x: offsetX + t * spread, y: -t * 3, z: -i * depth, ry, rx, scale: 1 };
};

export const poseTransform = (p: ShelfPose) =>
  `translate3d(${p.x}%, ${p.y}%, ${p.z}px) rotateY(${p.ry}deg) rotateX(${p.rx}deg) scale(${p.scale})`;

export const PerspectiveShelf: React.FC<{
  items: Array<{ key: string; node: React.ReactNode; label: string }>;
  pose?: ShelfOptions;
  /** When true, transforms are left to an external timeline (no inline pose). */
  managed?: boolean;
  className?: string;
  itemClassName?: string;
}> = ({ items, pose, managed = false, className, itemClassName }) => (
  <div className={`fx-shelf ${className ?? ""}`}>
    <ol className="fx-shelf__stage">
      {items.map((it, i) => (
        <li key={it.key} className={`fx-shelf__item ${itemClassName ?? ""}`} data-shelf-item={i} style={{ transform: managed ? undefined : poseTransform(shelfPose(i, items.length, pose)), zIndex: items.length - i }} aria-label={it.label}>
          {it.node}
        </li>
      ))}
    </ol>
  </div>
);
