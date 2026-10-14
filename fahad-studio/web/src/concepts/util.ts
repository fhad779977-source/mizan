/** Deterministic PRNG so concept screens look identical on every capture. */
export const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
export const W = 1440;
export const H = 900;
