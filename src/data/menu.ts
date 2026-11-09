import type { Localized } from '../i18n/ui';

export type MenuItem = {
  name: Localized;
  description: Localized;
  price: number;
  variant?: { label: Localized; price: number };
};

const chocolate: Localized = { fr: 'Chocolat', en: 'Chocolate' };

/** Carte relevée sur les visuels « Tarifs » de la marque, page par page. Prix en dinars tunisiens. */
export const menuPages: MenuItem[][] = [
  [
    {
      name: { fr: 'Cake citron', en: 'Lemon cake' },
      description: {
        fr: 'Cake moelleux au citron avec cream cheese.',
        en: 'Soft lemon cake with cream cheese.',
      },
      price: 25,
    },
    {
      name: { fr: 'Cake fruits secs', en: 'Dried fruit cake' },
      description: {
        fr: 'Cake authentique imbibé d’un sirop, avec 150 g de fruits secs et de l’eau de géranium.',
        en: 'Traditional cake soaked in syrup, with 150 g of dried fruit and geranium water.',
      },
      price: 29,
    },
    {
      name: { fr: 'Beignet gourmand', en: 'Gourmand beignet' },
      description: {
        fr: 'Beignet fourré au Nutella avec une couche de sucre à l’extérieur.',
        en: 'Beignet filled with Nutella, with a sugar coating.',
      },
      price: 5,
      variant: { label: chocolate, price: 4 },
    },
    {
      name: { fr: 'Beignet crème brûlée', en: 'Crème brûlée beignet' },
      description: {
        fr: 'Beignet fourré à la crème vanille et une couche de caramel croquante à l’extérieur.',
        en: 'Beignet filled with vanilla cream, with a crunchy caramel coating.',
      },
      price: 6,
    },
    {
      name: { fr: 'Donuts', en: 'Donuts' },
      description: {
        fr: 'Donut fourré au Nutella et enrobé au chocolat, avec des sprinkles ou du chocolat blanc.',
        en: 'Donut filled with Nutella and coated in chocolate, with sprinkles or white chocolate.',
      },
      price: 5,
      variant: { label: chocolate, price: 4 },
    },
    {
      name: { fr: 'Tiramisu', en: 'Tiramisu' },
      description: {
        fr: 'Tiramisu italien avec mascarpone, couvert par un nuage de cacao.',
        en: 'Italian tiramisu with mascarpone, topped with a cloud of cocoa.',
      },
      price: 11,
    },
  ],
  [
    {
      name: { fr: 'Cookies fondant (80 g)', en: 'Fondant cookies (80 g)' },
      description: {
        fr: 'Cookies new-yorkais avec Nutella à l’intérieur, qui fond dès la première bouchée.',
        en: 'New York-style cookies with Nutella inside, melting from the very first bite.',
      },
      price: 5,
    },
    {
      name: { fr: 'Box Cookies Bites', en: 'Cookies Bites box' },
      description: {
        fr: 'Une box de 250 g de mini cookies, servie avec une sauce Nutella.',
        en: 'A 250 g box of mini cookies, served with Nutella sauce.',
      },
      price: 15.5,
      variant: { label: chocolate, price: 13 },
    },
    {
      name: { fr: 'Box Mini Bites', en: 'Mini Bites box' },
      description: {
        fr: 'Une box de 150 g de mini cookies, servie avec une sauce Nutella.',
        en: 'A 150 g box of mini cookies, served with Nutella sauce.',
      },
      price: 12,
      variant: { label: chocolate, price: 10 },
    },
    {
      name: { fr: 'Fondant chocolat', en: 'Chocolate fondant' },
      description: {
        fr: 'Moelleux à l’extérieur, cœur chocolaté fondant à l’intérieur.',
        en: 'Soft on the outside, with a melting chocolate heart.',
      },
      price: 3.5,
    },
    {
      name: { fr: 'Brigadeiro', en: 'Brigadeiro' },
      description: {
        fr: 'Un brazilian cake : un cake chocolat fudgy avec une sauce brigadeiro très riche.',
        en: 'A Brazilian cake: fudgy chocolate cake with a very rich brigadeiro sauce.',
      },
      price: 8.5,
    },
  ],
];
