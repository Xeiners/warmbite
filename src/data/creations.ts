import type { Localized } from '../i18n/ui';
import type { PastryKind } from '../lib/pastry';

export type Creation = {
  /** Nom du fichier source : media-src/<slug>.mp4 */
  slug: string;
  name: Localized;
  note: Localized;
  price: string;
  art: PastryKind;
  /** Lien direct vers la vidéo TikTok, sinon le profil est utilisé. */
  tiktok?: string;
};

export const creations: Creation[] = [
  {
    slug: 'donuts',
    name: { fr: 'Donuts', en: 'Donuts' },
    note: { fr: 'Fourré au Nutella, enrobé au chocolat', en: 'Filled with Nutella, coated in chocolate' },
    price: '5 dt',
    art: 'donut',
  },
  {
    slug: 'tiramisu',
    name: { fr: 'Tiramisu', en: 'Tiramisu' },
    note: { fr: 'Mascarpone et nuage de cacao', en: 'Mascarpone and a cloud of cocoa' },
    price: '11 dt',
    art: 'tiramisu',
  },
  {
    slug: 'cake-citron',
    name: { fr: 'Cake citron', en: 'Lemon cake' },
    note: { fr: 'Moelleux au citron, cream cheese', en: 'Soft lemon cake, cream cheese' },
    price: '25 dt',
    art: 'cake',
  },
  {
    slug: 'beignet-creme-brulee',
    name: { fr: 'Beignet crème brûlée', en: 'Crème brûlée beignet' },
    note: { fr: 'Crème vanille, caramel croquant', en: 'Vanilla cream, crunchy caramel' },
    price: '6 dt',
    art: 'beignet',
  },
];
