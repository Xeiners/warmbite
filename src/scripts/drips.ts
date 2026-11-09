import gsap from 'gsap';
import { buildDripPaths, dripGeometry, type Drip, type DripBand } from '../lib/drip';

export type DripHandle = { setProgress: (value: number) => void };

/** Ganache vivante : chaque coulure rattrape sa cible à son rythme et s'étire avec la vitesse de scroll. */
export function createDrip(element: HTMLElement, initial: number, reduced: boolean): DripHandle {
  const svg = element.querySelector('svg')!;
  const body = element.querySelector('[data-body]')!;
  const rim = element.querySelector('[data-rim]')!;
  const shine = element.querySelector('[data-shine]')!;
  const mode = element.dataset.drip as DripBand;
  const mirror = element.dataset.mirror !== undefined;

  let width = 0;
  let band = 0;
  let drips: Drip[] = [];
  let lengths: number[] = [];
  let progress = reduced ? 1 : initial;
  let lastY = window.scrollY;
  let velocity = 0;
  let inView = false;
  let banked = 0;
  let frame = 0;
  let remaining = Infinity;

  const draw = () => {
    const paths = buildDripPaths(width, band, drips, lengths);
    body.setAttribute('d', paths.body);
    rim.setAttribute('d', paths.body);
    shine.setAttribute('d', paths.shine);
  };

  const layout = () => {
    const nextWidth = element.clientWidth;
    if (!nextWidth || nextWidth === width) return;
    const firstRun = width === 0;
    width = nextWidth;
    const geometry = dripGeometry(width, mode, mirror);
    band = geometry.band;
    drips = geometry.drips;
    lengths = drips.map((drip) => drip.len * progress);
    svg.setAttribute('viewBox', `0 0 ${width} ${geometry.height}`);
    if (firstRun || reduced) draw();
  };

  const tick = (time: number, deltaMs: number) => {
    if (!inView) return;
    banked += deltaMs;
    // Au repos, 30 images/s suffisent à l'ondulation et divisent le coût du repaint SVG.
    if (remaining < 6 && velocity < 20 && ++frame % 2) return;
    const dt = Math.max(banked, 1);
    banked = 0;
    remaining = 0;
    const y = window.scrollY;
    velocity += ((Math.abs(y - lastY) / dt) * 1000 - velocity) * 0.12;
    lastY = y;
    const boost = Math.min(velocity / 3200, 0.5);

    drips.forEach((drip, i) => {
      const wobble = Math.sin(time * 0.8 + i * 1.9) * (2 + drip.len * 0.012);
      const target = drip.len * progress * (1 + boost * (0.35 + (i % 3) * 0.3)) + wobble * progress;
      const rate = 1 - Math.pow(1 - (0.035 + (i % 4) * 0.012), dt / 16.67);
      remaining = Math.max(remaining, Math.abs(target - lengths[i]));
      lengths[i] += (target - lengths[i]) * rate;
    });
    draw();
  };

  layout();
  new ResizeObserver(layout).observe(element);

  if (!reduced) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      lastY = window.scrollY;
    }).observe(element);
    gsap.ticker.add(tick);
  }

  return {
    setProgress(value) {
      progress = value;
    },
  };
}
