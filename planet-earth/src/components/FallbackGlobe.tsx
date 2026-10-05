/**
 * Lightweight globe for devices without WebGL 2 / WebGPU.
 * Uses the same NASA texture, scrolled across a masked sphere in CSS.
 */
export function FallbackGlobe() {
  return (
    <div className="fallback" aria-hidden="true">
      <div className="fallback__stars" />
      <div className="fallback__globe">
        <div className="fallback__map" />
        <div className="fallback__shade" />
      </div>
    </div>
  );
}
