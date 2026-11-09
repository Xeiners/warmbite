import gsap from 'gsap';
import { buildDripPaths, dripGeometry, type Drip, type DripBand } from '../lib/drip';

export type DripHandle = { setProgress: (value: number) => void };

const MAX_STRETCH = 0.22;
const SCROLLING_SPEED = 20;
const CONVERGED = 6;

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
  let currentY = window.scrollY;
  let lastY = currentY;
  let velocity = 0;
  let inView = false;
  let frame = 0;
  let phase = 0;
  let stretch = 1;

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

  const tick = (_: number, deltaMs: number) => {
    if (!inView) return;
    const dt = Math.max(deltaMs, 1);
    velocity += ((Math.abs(currentY - lastY) / dt) * 1000 - velocity) * 0.12;
    lastY = currentY;

    // L'étirement au scroll est une simple transformation : le SVG n'est pas redessiné.
    const targetStretch = 1 + Math.min(velocity / 3200, 1) * MAX_STRETCH;
    const nextStretch = stretch + (targetStretch - stretch) * (1 - Math.pow(0.88, dt / 16.67));
    if (Math.abs(nextStretch - stretch) > 0.0005) {
      stretch = nextStretch;
      gsap.set(element, { scaleY: stretch });
    }

    const scrolling = velocity > SCROLLING_SPEED;
    if (!scrolling) phase += (dt / 1000) * 0.8;

    let remaining = 0;
    drips.forEach((drip, i) => {
      const wobble = Math.sin(phase + i * 1.9) * (2 + drip.len * 0.012);
      const target = (drip.len + wobble) * progress;
      const rate = 1 - Math.pow(1 - (0.035 + (i % 4) * 0.012), dt / 16.67);
      remaining = Math.max(remaining, Math.abs(target - lengths[i]));
      lengths[i] += (target - lengths[i]) * rate;
    });

    // Redessin à chaque image seulement pendant une coulée ; 30 images/s au repos, aucun pendant le scroll.
    if (remaining >= CONVERGED || (!scrolling && ++frame % 2 === 0)) draw();
  };

  layout();
  new ResizeObserver(layout).observe(element);

  if (!reduced) {
    // Position mise en cache : la lire pendant l'image forcerait un recalcul de style.
    window.addEventListener('scroll', () => { currentY = window.scrollY; }, { passive: true });
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      lastY = currentY;
    }).observe(element);
    gsap.ticker.add(tick);
  }

  return {
    setProgress(value) {
      progress = value;
    },
  };
}
