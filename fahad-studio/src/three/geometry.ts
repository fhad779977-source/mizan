// Procedural geometry for studio 3D scenes. These are abstract forms — the
// monogram mark and a lathe "object" — not models of real products.
import * as THREE from "three";

/** FAHAD "F" monogram with parallel slanted terminals. Height 2.4 units. */
export const createMonogramGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.62, 0);
  s.lineTo(0.62, 0.95);
  s.lineTo(1.12, 0.95);
  s.lineTo(1.4, 1.45);
  s.lineTo(0.62, 1.45);
  s.lineTo(0.62, 1.8);
  s.lineTo(1.5, 1.8);
  s.lineTo(1.84, 2.4);
  s.lineTo(0, 2.4);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.045,
    bevelSegments: 8,
    curveSegments: 4,
  });
  geo.computeBoundingBox();
  const b = geo.boundingBox!;
  // Center on X/Z, sit on the floor (y = 0).
  geo.translate(-(b.max.x + b.min.x) / 2, -b.min.y, -(b.max.z + b.min.z) / 2);
  geo.computeVertexNormals();
  return geo;
};

/** Abstract vessel profile — clearly a geometric study, not a real product. */
export const createVesselGeometry = () => {
  const pts: THREE.Vector2[] = [];
  const profile: Array<[number, number]> = [
    [0, 0],
    [0.55, 0],
    [0.62, 0.05],
    [0.66, 0.4],
    [0.68, 1.3],
    [0.6, 1.62],
    [0.32, 1.86],
    [0.26, 2.0],
    [0.26, 2.22],
    [0, 2.22],
  ];
  profile.forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
  return new THREE.LatheGeometry(pts, 96);
};
