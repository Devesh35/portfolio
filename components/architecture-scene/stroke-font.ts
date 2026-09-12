/**
 * A tiny single-stroke capital font (only the letters the scene needs) so
 * text can be drawn as real 3D line segments in the same line-art style as
 * everything else — no textures, no HTML overlays. Each glyph is a list of
 * polylines in a 0.65 × 1 cell; `strokeText` lays them out left to right.
 */

type Poly = [number, number][];
const G: Record<string, Poly[]> = {
  A: [[[0, 0], [0.325, 1], [0.65, 0]], [[0.12, 0.38], [0.53, 0.38]]],
  B: [[[0, 0], [0, 1], [0.5, 1], [0.62, 0.88], [0.62, 0.62], [0.5, 0.5], [0, 0.5]], [[0.5, 0.5], [0.65, 0.38], [0.65, 0.12], [0.53, 0], [0, 0]]],
  D: [[[0, 0], [0, 1], [0.4, 1], [0.65, 0.75], [0.65, 0.25], [0.4, 0], [0, 0]]],
  E: [[[0.65, 1], [0, 1], [0, 0], [0.65, 0]], [[0, 0.5], [0.5, 0.5]]],
  G: [[[0.65, 0.85], [0.5, 1], [0.15, 1], [0, 0.85], [0, 0.15], [0.15, 0], [0.5, 0], [0.65, 0.15], [0.65, 0.45], [0.35, 0.45]]],
  H: [[[0, 0], [0, 1]], [[0.65, 0], [0.65, 1]], [[0, 0.5], [0.65, 0.5]]],
  I: [[[0.325, 0], [0.325, 1]]],
  L: [[[0, 1], [0, 0], [0.65, 0]]],
  M: [[[0, 0], [0, 1], [0.325, 0.55], [0.65, 1], [0.65, 0]]],
  N: [[[0, 0], [0, 1], [0.65, 0], [0.65, 1]]],
  O: [[[0.15, 0], [0.5, 0], [0.65, 0.15], [0.65, 0.85], [0.5, 1], [0.15, 1], [0, 0.85], [0, 0.15], [0.15, 0]]],
  R: [[[0, 0], [0, 1], [0.5, 1], [0.65, 0.85], [0.65, 0.62], [0.5, 0.5], [0, 0.5]], [[0.3, 0.5], [0.65, 0]]],
  S: [[[0.65, 0.85], [0.5, 1], [0.15, 1], [0, 0.85], [0, 0.65], [0.15, 0.5], [0.5, 0.5], [0.65, 0.35], [0.65, 0.15], [0.5, 0], [0.15, 0], [0, 0.15]]],
  T: [[[0, 1], [0.65, 1]], [[0.325, 1], [0.325, 0]]],
  U: [[[0, 1], [0, 0.2], [0.15, 0], [0.5, 0], [0.65, 0.2], [0.65, 1]]],
  Y: [[[0, 1], [0.325, 0.5], [0.65, 1]], [[0.325, 0.5], [0.325, 0]]],
};

const ADVANCE = 0.9;

/** Width of a line of text at scale 1. */
export function strokeWidth(text: string) {
  return text.length * ADVANCE - (ADVANCE - 0.65);
}

/**
 * Line-segment pairs for `text`, in the XY plane, starting at (x0, y0),
 * letters `scale` tall. Unknown characters (and spaces) just advance.
 */
export function strokeText(text: string, x0: number, y0: number, scale: number): number[] {
  const pts: number[] = [];
  let cx = x0;
  for (const ch of text.toUpperCase()) {
    const glyph = G[ch];
    if (glyph) {
      glyph.forEach((poly) => {
        for (let i = 0; i < poly.length - 1; i++) {
          pts.push(cx + poly[i][0] * scale, y0 + poly[i][1] * scale, 0, cx + poly[i + 1][0] * scale, y0 + poly[i + 1][1] * scale, 0);
        }
      });
    }
    cx += ADVANCE * scale;
  }
  return pts;
}
