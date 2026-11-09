import gsap from 'gsap';
import { enableDrag } from './drag';

const RUBBER = 0.25;

/** Carte feuilletable : les pages suivent le geste, puis se calent sur la plus proche. */
export function initMenuPager(root: HTMLElement, reduced: boolean) {
  const viewport = root.querySelector<HTMLElement>('[data-pages]')!;
  const track = root.querySelector<HTMLElement>('[data-pages-track]')!;
  const prev = root.querySelector<HTMLButtonElement>('[data-page-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-page-next]')!;
  const counter = root.querySelector<HTMLElement>('[data-page-count]')!;
  const total = root.querySelectorAll('[data-page]').length;
  const last = total - 1;
  const clamp = gsap.utils.clamp(0, last);
  const state = { position: 0 };

  let index = 0;
  let origin = 0;

  const render = () => gsap.set(track, { xPercent: state.position * -100 });

  const goTo = (page: number, ease = 'expo.inOut', duration = 0.9) => {
    index = clamp(page);
    prev.disabled = index === 0;
    next.disabled = index === last;
    counter.textContent = `${index + 1} / ${total}`;
    gsap.to(state, {
      position: index,
      duration: reduced ? 0.01 : duration,
      ease,
      overwrite: true,
      onUpdate: render,
    });
  };

  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
  });

  enableDrag(viewport, {
    onStart() {
      gsap.killTweensOf(state);
      origin = state.position;
    },
    onMove(deltaX) {
      const position = origin - deltaX / viewport.clientWidth;
      const overshoot = position - clamp(position);
      state.position = clamp(position) + overshoot * RUBBER;
      render();
    },
    onEnd(flick) {
      const thrown = gsap.utils.clamp(-0.6, 0.6, (-flick * 220) / viewport.clientWidth);
      goTo(Math.round(state.position + thrown), 'expo.out', 0.75);
    },
  });

  return {
    /** Petit mouvement d'amorce qui montre que la carte se feuillette. */
    hint() {
      if (reduced || index !== 0) return;
      gsap.to(state, {
        position: 0.08,
        duration: 0.45,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        overwrite: true,
        onUpdate: render,
      });
    },
  };
}
