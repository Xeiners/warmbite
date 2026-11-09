import { defineConfig } from 'astro/config';

// URL publique, pour l'adresse canonique et l'image de partage sur les réseaux.
// Vercel la fournit automatiquement ; sur un autre hébergeur, définir SITE_URL.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : undefined);

export default defineConfig({
  site,
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
