import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initCarousel } from './carousel';
import { createDrip, type DripHandle } from './drips';
import { initMenuPager } from './menu';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SCROLL_SMOOTHING = 0.35;
const all = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

function initSmoothScroll() {
  if (reduced) return;
  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  // En priorité : le défilement lit la mise en page avant que GSAP n'écrive les transformations.
  gsap.ticker.add((time) => lenis.raf(time * 1000), false, true);
  gsap.ticker.lagSmoothing(0);

  all<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector<HTMLElement>(link.hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.5 });
    });
  });
}

function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]')!;
  let last = window.scrollY;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-floating', y > 90);
    if (Math.abs(y - last) > 6) {
      header.classList.toggle('is-hidden', y > last && y > 360);
      last = y;
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function playHeroIntro(drip: DripHandle) {
  const stems = all<SVGPathElement>('[data-stem]');
  gsap.set(stems, { strokeDasharray: 1, strokeDashoffset: 1 });
  drip.setProgress(1);

  gsap
    .timeline({ defaults: { ease: 'expo.out' }, onComplete: releaseHeroIntro })
    .from('[data-ch]', { yPercent: 112, rotation: 5, duration: 1.15, stagger: 0.045 }, 0.15)
    .to(stems, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
    .from('[data-leaf]', { scale: 0, svgOrigin: '0 0', duration: 0.8, stagger: 0.016, ease: 'back.out(1.8)' }, 0.45)
    .from('[data-whisk]', { y: -36, rotation: -46, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.5)' }, 0.5)
    .from('[data-treat]', { scale: 0, rotation: -30, duration: 0.9, stagger: 0.09, ease: 'back.out(2)' }, 0.85)
    .from('[data-wordheart]', { scale: 0, duration: 0.7, ease: 'back.out(3.2)' }, 0.95)
    .from('[data-rule-line]', { scaleX: 0, duration: 0.95 }, 0.8)
    .from('[data-rule-heart]', { scale: 0, duration: 0.6, ease: 'back.out(3)' }, 0.9)
    .from('[data-hero-fade]', { y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.09 }, 0.9);
}

/** L'intro terminée, retire ses styles résiduels : le navigateur n'a plus à suivre ces éléments. */
function releaseHeroIntro() {
  gsap.set(
    '[data-ch], [data-leaf], [data-stem], [data-whisk], [data-wordheart], [data-rule-line], [data-rule-heart], [data-treat], [data-hero-fade]',
    { clearProps: 'all' },
  );
  all('.wordmark__line').forEach((line) => {
    line.style.clipPath = 'none';
  });
}

function initScrollScenes(creationsDrip: DripHandle, showMenuHint: () => void) {
  ScrollTrigger.create({ trigger: '[data-menu]', start: 'top 45%', once: true, onEnter: showMenuHint });

  // Le chocolat monte en dôme derrière le hero, comme les arches du menu. Le titre et le haut
  // des arches dépassent de la section : ils suivent le même défilement que le dôme.
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#creations', start: 'top bottom', end: 'top 38%', scrub: SCROLL_SMOOTHING },
    })
    .fromTo('[data-dome]', { yPercent: 100 }, { yPercent: 0, duration: 1 }, 0)
    .fromTo(
      '[data-dome-rings]',
      { yPercent: 62, scale: 0.9, opacity: 0, transformOrigin: '50% 100%' },
      { yPercent: 0, scale: 1, opacity: 1, duration: 0.9 },
      0,
    )
    .fromTo('[data-reveal-dome]', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.04 }, 0.88)
    .from('.stage__arches', { opacity: 0, duration: 0.2 }, 0.88);

  gsap.to('[data-hero-inner]', {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: SCROLL_SMOOTHING },
  });

  ScrollTrigger.create({
    trigger: '#carte',
    start: 'top 92%',
    end: 'top 15%',
    scrub: true,
    onUpdate: (self) => creationsDrip.setProgress(0.12 + self.progress * 0.88),
  });

  // Révélations en opacité seule : le contenu reste accessible aux lecteurs d'écran.
  gsap.set('[data-reveal]', { opacity: 0, y: 34 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.09, ease: 'expo.out', overwrite: true }),
  });

  all('[data-row]').forEach((row) => {
    const rule = row.querySelector('[data-rule]');
    gsap.set(row.children, { opacity: 0, y: 22 });
    if (rule) gsap.set(rule, { opacity: 1, y: 0, scaleX: 0 });

    ScrollTrigger.create({
      trigger: row,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        const content = [...row.children].filter((child) => child !== rule);
        gsap.to(content, { opacity: 1, y: 0, duration: 0.85, stagger: 0.07, ease: 'expo.out' });
        if (rule) gsap.to(rule, { scaleX: 1, duration: 1.2, ease: 'expo.out' });
      },
    });
  });

  gsap.fromTo(
    '[data-stamp]',
    { rotation: -16 },
    {
      rotation: 10,
      ease: 'none',
      scrollTrigger: { trigger: '#carte', start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );

  all('.carte__arches, .order__arches').forEach((arches) => {
    const rings = arches.querySelectorAll('[data-ring]');
    gsap.set(rings, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(rings, {
      strokeDashoffset: 0,
      duration: 1.8,
      stagger: 0.12,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: arches, start: 'top 85%', once: true },
    });
  });
}

function start() {
  initSmoothScroll();
  initHeader();

  const heroDrip = createDrip(document.querySelector('.hero__drip')!, 0, reduced);
  const creationsDrip = createDrip(document.querySelector('.creations__drip')!, 0.12, reduced);
  initCarousel(document.querySelector('[data-carousel]')!, reduced);
  const menu = initMenuPager(document.querySelector('[data-menu]')!, reduced);

  root.classList.add('is-ready');

  if (reduced) return;
  playHeroIntro(heroDrip);
  initScrollScenes(creationsDrip, menu.hint);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

start();
