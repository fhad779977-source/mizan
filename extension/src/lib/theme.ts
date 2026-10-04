export type XTheme = 'light' | 'dark';

/** يحدد ثيم X من لون خلفية الصفحة (X يضبطه على body: أبيض، أزرق داكن، أسود) */
export function themeFromColor(color: string): XTheme {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
  if (!m) return 'light';
  if (m[4] !== undefined && Number(m[4]) === 0) return 'light';
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5 ? 'dark' : 'light';
}

export function detectXTheme(doc: Document = document): XTheme {
  const bodyColor = doc.body ? getComputedStyle(doc.body).backgroundColor : '';
  if (bodyColor && !/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(bodyColor)) return themeFromColor(bodyColor);
  const htmlColor = getComputedStyle(doc.documentElement).backgroundColor;
  if (htmlColor && !/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(htmlColor)) return themeFromColor(htmlColor);
  return doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
