import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initCarousel } from './carousel';
import { createDrip, type DripHandle } from './drips';
import { initMenuPager } from './menu';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const all = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

function initSmoothScroll() {
  if (reduced) return;
  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
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
    .timeline({ defaults: { ease: 'expo.out' } })
    .from('[data-ch]', { yPercent: 112, rotation: 5, duration: 1.15, stagger: 0.045 }, 0.15)
    .to(stems, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
    .from('[data-leaf]', { scale: 0, svgOrigin: '0 0', duration: 0.8, stagger: 0.016, ease: 'back.out(1.8)' }, 0.45)
    .from('[data-whisk]', { y: -36, rotation: -46, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.5)' }, 0.5)
    .from('[data-wordheart]', { scale: 0, duration: 0.7, ease: 'back.out(3.2)' }, 0.95)
    .from('[data-rule-line]', { scaleX: 0, duration: 0.95 }, 0.8)
    .from('[data-rule-heart]', { scale: 0, duration: 0.6, ease: 'back.out(3)' }, 0.9)
    .from('[data-hero-fade]', { y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.09 }, 0.9);
}

function initScrollScenes(creationsDrip: DripHandle, showMenuHint: () => void) {
  ScrollTrigger.create({ trigger: '[data-menu]', start: 'top 45%', once: true, onEnter: showMenuHint });

  // Le chocolat monte en dôme derrière le hero, comme les arches du menu.
  gsap.fromTo(
    '[data-dome]',
    { yPercent: 100 },
    {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: '#creations', start: 'top bottom', end: 'top 45%', scrub: true },
    },
  );

  const domeRings = all<SVGPathElement>('[data-dome-ring]');
  gsap.set(domeRings, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to(domeRings, {
    strokeDashoffset: 0,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: '#creations', start: 'top 95%', end: 'top 35%', scrub: true },
  });

  gsap.to('[data-hero-inner]', {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
  });

  ScrollTrigger.create({
    trigger: '#carte',
    start: 'top 92%',
    end: 'top 15%',
    scrub: true,
    onUpdate: (self) => creationsDrip.setProgress(0.12 + self.progress * 0.88),
  });

  // Le titre vit dans le dôme : il n'apparaît qu'une fois le chocolat passé derrière lui.
  // Révélations en opacité seule : le contenu reste accessible aux lecteurs d'écran.
  gsap.from('[data-reveal-dome]', {
    opacity: 0,
    y: 34,
    duration: 1,
    stagger: 0.09,
    ease: 'expo.out',
    scrollTrigger: { trigger: '#creations', start: 'top 52%', once: true },
  });

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

  all('[data-arches]').forEach((arches) => {
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
