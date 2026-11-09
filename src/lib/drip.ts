export type DripBand = 'hero' | 'flush';
export type Drip = { x: number; r: number; len: number };
export type DripGeometry = { band: number; height: number; drips: Drip[] };
export type DripPaths = { body: string; shine: string };

/** Position (0-1), largeur et longueur relatives : le rythme des coulures du logo. */
const PATTERN: ReadonlyArray<readonly [number, number, number]> = [
  [0.015, 0.9, 0.62],
  [0.075, 1.1, 1],
  [0.125, 0.7, 0.42],
  [0.175, 1, 0.82],
  [0.235, 0.75, 0.36],
  [0.29, 1.15, 0.62],
  [0.35, 0.7, 0.3],
  [0.41, 0.9, 0.46],
  [0.47, 0.7, 0.24],
  [0.53, 0.85, 0.38],
  [0.59, 0.7, 0.26],
  [0.65, 1.05, 0.52],
  [0.71, 0.75, 0.34],
  [0.77, 1.1, 0.78],
  [0.83, 0.7, 0.4],
  [0.885, 1.15, 0.96],
  [0.945, 0.8, 0.5],
  [0.99, 0.9, 0.7],
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const n = (value: number) => Math.round(value * 10) / 10;

export function dripGeometry(width: number, mode: DripBand, mirror = false): DripGeometry {
  const narrow = width < 720;
  const band = mode === 'hero' ? clamp(width * 0.055, 66, 84) : 2;
  const maxLen = clamp(width * 0.17, 110, 250);
  const base = clamp(width * 0.0135, 11, 26) * (narrow ? 1.15 : 1);
  const set = narrow ? PATTERN.filter((_, i) => i % 2 === 1) : PATTERN;
  const drips = set
    .map(([p, rf, lf]) => ({
      x: (mirror ? 1 - p : p) * width,
      r: base * rf,
      len: maxLen * lf,
    }))
    .sort((a, b) => a.x - b.x);

  return { band, height: Math.ceil(band + maxLen + 60), drips };
}

/** Construit le contour liquide, de droite à gauche, à partir des longueurs courantes. */
export function buildDripPaths(
  width: number,
  band: number,
  drips: Drip[],
  lengths: number[],
): DripPaths {
  let body = `M0 0H${n(width)}V${n(band)}`;
  let shine = '';

  for (let i = drips.length - 1; i >= 0; i--) {
    const { x, r: baseR } = drips[i];
    const length = Math.max(0, lengths[i]);
    const grow = Math.min(1, Math.sqrt(length / (baseR * 2.2)));
    const r = baseR * grow;
    if (r < 0.3) continue;

    const neck = r * 0.8;
    const shoulder = r * 0.95;
    const top = band + shoulder;
    const tip = band + Math.max(shoulder, length - r);
    const mid = (top + tip) / 2;

    body +=
      `L${n(x + neck + shoulder)} ${n(band)}` +
      `C${n(x + neck + shoulder * 0.4)} ${n(band)} ${n(x + neck)} ${n(band + shoulder * 0.4)} ${n(x + neck)} ${n(top)}` +
      `C${n(x + neck)} ${n(mid)} ${n(x + r)} ${n(mid)} ${n(x + r)} ${n(tip)}` +
      `C${n(x + r)} ${n(tip + r * 1.34)} ${n(x - r)} ${n(tip + r * 1.34)} ${n(x - r)} ${n(tip)}` +
      `C${n(x - r)} ${n(mid)} ${n(x - neck)} ${n(mid)} ${n(x - neck)} ${n(top)}` +
      `C${n(x - neck)} ${n(band + shoulder * 0.4)} ${n(x - neck - shoulder * 0.4)} ${n(band)} ${n(x - neck - shoulder)} ${n(band)}`;

    if (length > baseR * 2.6) {
      shine += `M${n(x - r * 0.42)} ${n(tip - r * 0.5)}v${n(r * 0.75)}`;
    }
  }

  return { body: `${body}L0 ${n(band)}Z`, shine };
}
