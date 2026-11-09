export type PastryKind = 'donut' | 'tiramisu' | 'cake' | 'beignet';

const n = (value: number) => Math.round(value * 10) / 10;

/** Contour circulaire ondulé (glaçage de donut). */
export function wavyCircle(cx: number, cy: number, r: number, amp: number, lobes: number) {
  const steps = 96;
  const points: string[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const radius = r + Math.sin(a * lobes) * amp + Math.sin(a * (lobes - 3) + 1.2) * amp * 0.4;
    points.push(`${n(cx + Math.cos(a) * radius)} ${n(cy + Math.sin(a) * radius)}`);
  }
  return `M${points.join('L')}Z`;
}

/** Couche horizontale à bord supérieur ondulé, fermée vers le bas (strates du tiramisu). */
export function wavyLayer(y: number, amp: number, waves: number, x0 = 60, x1 = 260, bottom = 320) {
  const step = (x1 - x0) / waves;
  let d = `M${x0} ${y}`;
  for (let i = 0; i < waves; i++) {
    const direction = i % 2 === 0 ? -1 : 1;
    d += `Q${n(x0 + step * (i + 0.5))} ${n(y + amp * direction)} ${n(x0 + step * (i + 1))} ${y}`;
  }
  return `${d}V${bottom}H${x0}Z`;
}

export type Sprinkle = { x1: number; y1: number; x2: number; y2: number; color: string };

export function donutSprinkles(cx: number, cy: number): Sprinkle[] {
  const palette = ['#ffd3dc', '#fff5f3', '#f49092'];
  return Array.from({ length: 24 }, (_, i) => {
    const angle = i * 2.39996;
    const radius = 60 + ((i * 37) % 32);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const tilt = (i * 71 * Math.PI) / 180;
    const half = 7.5;
    return {
      x1: n(x - Math.cos(tilt) * half),
      y1: n(y - Math.sin(tilt) * half),
      x2: n(x + Math.cos(tilt) * half),
      y2: n(y + Math.sin(tilt) * half),
      color: palette[i % palette.length],
    };
  });
}
