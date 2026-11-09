export type Lang = 'fr' | 'en';
export type Localized = Record<Lang, string>;

export const languages: Record<Lang, { label: string; name: string; href: string; locale: string }> = {
  fr: { label: 'FR', name: 'Français', href: '/', locale: 'fr_FR' },
  en: { label: 'EN', name: 'English', href: '/en/', locale: 'en_US' },
};

const fr = {
  meta: {
    title: 'Pâtisserie maison sur commande',
    description:
      'Warm Bite, pâtisserie maison sur commande : cakes, cookies, beignets, donuts, tiramisu, box et fondants. Commandez au 55 321 754.',
  },
  skip: 'Aller au contenu',
  header: {
    home: '{name}, retour en haut de page',
    nav: 'Navigation principale',
    languageNav: 'Choix de la langue',
    creations: 'Créations',
    menu: 'La carte',
    order: 'Commander',
  },
  hero: {
    heading: 'Warm Bite, pâtisserie maison sur commande',
    lead: 'Cakes, cookies, beignets, donuts, tiramisu, box et fondants. Tout est fait maison, sur commande.',
    creations: 'Voir les créations',
    call: 'Appeler le {phone}',
  },
  creations: {
    eyebrow: 'Les créations',
    title: 'Ça sort de la cuisine.',
    carousel: 'Nos créations en vidéo',
    roleCarousel: 'carrousel',
    roleSlide: 'diapositive',
    position: '{n} sur {total} : {name}',
    video: 'Vidéo : {name}',
    tiktok: 'Voir sur TikTok',
    previous: 'Création précédente',
    next: 'Création suivante',
    goTo: 'Aller à {name}',
    pause: 'Mettre le carrousel en pause',
    play: 'Relancer le carrousel',
  },
  carte: {
    eyebrow: 'Tarifs',
    title: 'La carte',
    pageLabel: 'Page {n} sur {total}',
    previous: 'Page précédente de la carte',
    next: 'Page suivante de la carte',
    hint: 'Glissez pour tourner la page',
  },
  order: {
    eyebrow: 'Commander',
    title: 'Une envie ?',
    call: 'Appeler',
    follow: 'Suivre sur TikTok',
    steps: [
      { title: 'Choisissez', text: 'Sur la carte, ou devant les vidéos TikTok.' },
      { title: 'Appelez', text: 'Passez votre commande au {phone}.' },
      { title: 'Savourez', text: 'Préparé maison, spécialement pour vous.' },
    ],
  },
  footer: {
    credit: 'Développé par',
  },
};

const en: typeof fr = {
  meta: {
    title: 'Homemade pastries made to order',
    description:
      'Warm Bite, homemade pastries made to order: cakes, cookies, beignets, donuts, tiramisu, boxes and fondants. Order on 55 321 754.',
  },
  skip: 'Skip to content',
  header: {
    home: '{name}, back to top',
    nav: 'Main navigation',
    languageNav: 'Choose a language',
    creations: 'Creations',
    menu: 'Menu',
    order: 'Order',
  },
  hero: {
    heading: 'Warm Bite, homemade pastries made to order',
    lead: 'Cakes, cookies, beignets, donuts, tiramisu, boxes and fondants. All homemade, all made to order.',
    creations: 'See our creations',
    call: 'Call {phone}',
  },
  creations: {
    eyebrow: 'Our creations',
    title: 'Fresh from the kitchen.',
    carousel: 'Our creations on video',
    roleCarousel: 'carousel',
    roleSlide: 'slide',
    position: '{n} of {total}: {name}',
    video: 'Video: {name}',
    tiktok: 'Watch on TikTok',
    previous: 'Previous creation',
    next: 'Next creation',
    goTo: 'Go to {name}',
    pause: 'Pause the carousel',
    play: 'Resume the carousel',
  },
  carte: {
    eyebrow: 'Prices',
    title: 'The menu',
    pageLabel: 'Page {n} of {total}',
    previous: 'Previous menu page',
    next: 'Next menu page',
    hint: 'Swipe to turn the page',
  },
  order: {
    eyebrow: 'Order',
    title: 'Craving something?',
    call: 'Call',
    follow: 'Follow on TikTok',
    steps: [
      { title: 'Choose', text: 'From the menu, or while watching our TikTok videos.' },
      { title: 'Call', text: 'Place your order on {phone}.' },
      { title: 'Enjoy', text: 'Homemade, just for you.' },
    ],
  },
  footer: {
    credit: 'Developed by',
  },
};

export const ui: Record<Lang, typeof fr> = { fr, en };
