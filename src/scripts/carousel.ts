import gsap from 'gsap';
import { enableDrag } from './drag';

const STILL_SECONDS = 5.5;
const SIDE_DIM = 0.26;
const CLICK_TOLERANCE = 6;

/**
 * Carrousel à position continue : chaque carte est une fonction de `state.position`.
 * Le glissement modifie directement cette valeur, l'autoplay et les boutons l'animent.
 */
export function initCarousel(root: HTMLElement, reduced: boolean) {
  const all = <T extends Element>(selector: string) => [...root.querySelectorAll<T>(selector)];
  const slides = all<HTMLElement>('[data-slide]');
  const captions = all<HTMLElement>('[data-caption]');
  const fills = all<HTMLElement>('[data-fill]');
  const segments = all<HTMLButtonElement>('[data-seg]');
  const dims = all<HTMLElement>('[data-dim]');
  const videos = slides.map((slide) => slide.querySelector('video'));
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const arches = root.querySelector('.stage__arches');

  const { labelPause = '', labelPlay = '', labelPosition = '' } = root.dataset;
  const count = slides.length;
  const fadeSpan = Math.max(count / 2 - 1, 0.25);
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const state = { position: 0 };

  let target = 0;
  let active = 0;
  let spacing = 0;
  let lift = 0;
  let inView = false;
  let elapsed = 0;
  let moving = false;
  let dragging = false;
  let dragOrigin = 0;
  let travelled = 0;
  let running = !reduced && !saveData;

  const wrap = (value: number) => ((value % count) + count) % count;

  const offsetOf = (index: number) => {
    const value = wrap(index - state.position);
    return value >= count / 2 ? value - count : value;
  };

  const syncVideos = () => {
    videos.forEach((video, i) => {
      if (!video) return;
      if (i === active && running && inView) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const warm = (index: number) => {
    const video = videos[wrap(index)];
    if (video && video.preload !== 'auto') {
      video.preload = 'auto';
      video.load();
    }
  };

  const setFill = (index: number, value: number) => {
    gsap.set(fills[index], { scaleX: Math.min(1, value) });
  };

  const setCaption = (index: number, immediate = false) => {
    captions.forEach((caption, i) => {
      const shown = i === index;
      if (immediate) {
        gsap.set(caption, { autoAlpha: shown ? 1 : 0, y: 0 });
      } else if (shown) {
        gsap.fromTo(caption, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, delay: 0.08, ease: 'power3.out', overwrite: true });
      } else {
        gsap.to(caption, { autoAlpha: 0, y: -10, duration: 0.22, ease: 'power2.in', overwrite: true });
      }
    });
  };

  const setActive = (index: number) => {
    setFill(active, 0);
    active = index;
    elapsed = 0;

    const video = videos[active];
    if (video) video.currentTime = 0;
    warm(active + 1);
    warm(active - 1);

    setCaption(active);
    segments.forEach((segment, i) => segment.setAttribute('aria-current', i === active ? 'true' : 'false'));
    live.textContent = labelPosition
      .replace('{n}', String(active + 1))
      .replace('{total}', String(count))
      .replace('{name}', captions[active].querySelector('h3')?.textContent ?? '');

    if (arches && !reduced) {
      gsap.fromTo(arches, { scale: 0.975 }, { scale: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)', overwrite: true });
    }
    syncVideos();
  };

  const render = () => {
    slides.forEach((slide, i) => {
      const offset = offsetOf(i);
      const distance = Math.abs(offset);
      const clamped = Math.min(distance, 2);
      gsap.set(slide, {
        x: offset * spacing,
        y: clamped * lift,
        scale: 1 - clamped * 0.2,
        rotation: offset * 4.5,
        autoAlpha: Math.min(1, (count / 2 - distance) / fadeSpan),
        zIndex: Math.round(100 - distance * 20),
      });
      gsap.set(dims[i], { opacity: Math.min(distance, 1) * SIDE_DIM });
    });

    const nearest = wrap(Math.round(state.position));
    if (nearest !== active) setActive(nearest);
  };

  const animateTo = (destination: number, ease: string, duration: number) => {
    target = destination;
    moving = true;
    gsap.to(state, {
      position: destination,
      duration: reduced ? 0.01 : duration,
      ease,
      overwrite: true,
      onUpdate: render,
      onComplete() {
        moving = false;
      },
    });
  };

  // Un clic pendant un mouvement repart sans à-coup.
  const moveBy = (steps: number) => animateTo(target + steps, moving ? 'power3.out' : 'expo.inOut', 0.95);

  const setRunning = (value: boolean) => {
    running = value;
    toggle.toggleAttribute('data-paused', !value);
    toggle.setAttribute('aria-label', value ? labelPause : labelPlay);
    live.setAttribute('aria-live', value ? 'off' : 'polite');
    syncVideos();
  };

  // Progression : temps réel de la vidéo, sinon minuterie pour les visuels fixes.
  gsap.ticker.add((_, deltaMs) => {
    if (!running || !inView || moving || dragging || document.hidden) return;
    const video = videos[active];
    let progress: number;

    if (video && video.readyState >= 2 && video.duration > 0 && !video.paused) {
      progress = video.currentTime / video.duration;
    } else {
      elapsed += deltaMs / 1000;
      progress = elapsed / STILL_SECONDS;
    }

    setFill(active, progress);
    if (progress >= 0.995) moveBy(1);
  });

  videos.forEach((video, i) => {
    video?.addEventListener('ended', () => {
      if (i === active && running && !dragging && !moving) moveBy(1);
    });
  });

  root.querySelector('[data-next]')!.addEventListener('click', () => moveBy(1));
  root.querySelector('[data-prev]')!.addEventListener('click', () => moveBy(-1));
  toggle.addEventListener('click', () => setRunning(!running));

  segments.forEach((segment, i) => {
    segment.addEventListener('click', () => {
      const steps = wrap(i - target);
      moveBy(steps > count / 2 ? steps - count : steps);
    });
  });

  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (travelled > CLICK_TOLERANCE) return;
      const offset = Math.round(offsetOf(i));
      if (Math.abs(offset) === 1) moveBy(offset);
    });
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') moveBy(1);
    if (event.key === 'ArrowLeft') moveBy(-1);
  });

  enableDrag(stage, {
    onStart() {
      gsap.killTweensOf(state);
      moving = false;
      dragging = true;
      dragOrigin = state.position;
      travelled = 0;
    },
    onMove(deltaX) {
      travelled = Math.max(travelled, Math.abs(deltaX));
      state.position = dragOrigin - deltaX / spacing;
      render();
    },
    onEnd(flick) {
      dragging = false;
      const thrown = gsap.utils.clamp(-0.6, 0.6, (-flick * 180) / spacing);
      animateTo(Math.round(state.position + thrown), 'expo.out', 0.8);
    },
  });

  // Vidéos chargées et lues uniquement lorsque le carrousel est à l'écran.
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        warm(active);
        warm(active + 1);
        warm(active - 1);
      }
      syncVideos();
    },
    { threshold: 0.2 },
  ).observe(stage);

  document.addEventListener('visibilitychange', syncVideos);

  const measure = () => {
    const frame = slides[0].offsetWidth;
    spacing = frame * (window.innerWidth < 720 ? 0.88 : 0.96);
    lift = frame * 0.09;
  };

  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    measure();
    render();
  });

  measure();
  render();
  setCaption(0, true);
  setRunning(running);
}
