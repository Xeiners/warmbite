# Warm Bite

![Warm Bite](public/og.jpg)

Site vitrine bilingue (français et anglais) de Warm Bite, pâtisserie maison sur commande.

## Stack

- [Astro](https://astro.build) : site statique, sans framework côté client
- [GSAP](https://gsap.com) et ScrollTrigger : animations
- [Lenis](https://github.com/darkroomengineering/lenis) : défilement fluide

## Démarrer

Prérequis : Node.js 22.23 ou plus récent. Le déploiement utilise Node.js 26.

```sh
npm install
npm run dev
```

| Commande          | Action                                |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Lance le serveur de développement     |
| `npm run build`   | Génère le site dans `dist/`           |
| `npm run preview` | Sert le build en local                |
| `npm run videos`  | Encode les vidéos du carrousel        |

## Structure

```text
public/          Icônes, image de partage, vidéos encodées
scripts/         Encodage des vidéos
src/
  components/    Sections de la page
  data/          Carte, carrousel, coordonnées
  i18n/ui.ts     Textes de l'interface, en français et en anglais
  lib/           Génération de la ganache et des illustrations
  pages/         Routes : / (français) et /en/ (anglais)
  scripts/       Animations, carrousel, pages de la carte
```

## Modifier le contenu

| Contenu                                   | Fichier                 |
| ----------------------------------------- | ----------------------- |
| Produits et prix, pour les deux langues   | `src/data/menu.ts`      |
| Cartes du carrousel                       | `src/data/creations.ts` |
| Textes de l'interface                     | `src/i18n/ui.ts`        |
| Téléphone, TikTok, slogan, crédit         | `src/data/site.ts`      |

## Ajouter les vidéos du carrousel

Une carte sans vidéo affiche son illustration.

1. Déposer les fichiers dans `media-src/`, sous le nom du slug défini dans `src/data/creations.ts` :
   `donuts.mp4`, `tiramisu.mp4`, `cake-citron.mp4`, `beignet-creme-brulee.mp4`.
2. Lancer `npm run videos`. Le script produit des versions WebM et MP4 (720 px de large, 14 s maximum, sans le son)
   et un poster dans `public/videos/`, puis met à jour `src/data/videos.json`.
3. Versionner `public/videos/` et `src/data/videos.json` : les vidéos ne sont pas encodées au déploiement.

Pour relier une carte à sa vidéo TikTok, renseigner son champ `tiktok` dans `src/data/creations.ts`.

## Déployer

### Vercel

Importer le dépôt GitHub dans Vercel, puis lancer le déploiement. Astro est détecté automatiquement et aucune
variable d'environnement n'est nécessaire : l'URL de production est récupérée au build.

### Autre hébergeur

Définir la variable `SITE_URL` (par exemple `https://mon-domaine.com`), lancer `npm run build`, puis publier le
contenu de `dist/`.

## Crédits

Développé par [komodev](mailto:komo.devpro@gmail.com).
Le logo, les textes et les visuels appartiennent à Warm Bite.
