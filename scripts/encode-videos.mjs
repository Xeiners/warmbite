// Encode les vidéos déposées dans media-src/ pour le carrousel.
// Nommer chaque fichier d'après le slug de src/data/creations.ts, puis : npm run videos
//
// Sorties dans public/videos/ : <slug>.webm (VP9), <slug>.mp4 (H.264), <slug>.webp (poster).
// L'audio est retiré : le carrousel tourne en muet, et les musiques TikTok
// ne sont pas libres de droits pour un site commercial.

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, basename, join } from 'node:path';
import { promisify } from 'node:util';
import ffmpeg from 'ffmpeg-static';

const run = promisify(execFile);
const SRC = 'media-src';
const OUT = 'public/videos';
const MANIFEST = 'src/data/videos.json';
const MAX_SECONDS = 14;
const WIDTH = 720;
const EXT = new Set(['.mp4', '.mov', '.m4v', '.webm']);

const files = existsSync(SRC)
  ? (await readdir(SRC)).filter((f) => EXT.has(extname(f).toLowerCase()))
  : [];

if (!files.length) {
  console.log(`Aucune vidéo dans ${SRC}/ : le carrousel garde ses illustrations.`);
  await writeFile(MANIFEST, '{}\n');
  process.exit(0);
}

await mkdir(OUT, { recursive: true });

/** Lit la durée et les dimensions affichées par ffmpeg (il sort sur stderr). */
async function probe(path) {
  const output = await run(ffmpeg, ['-i', path]).catch((error) => error.stderr ?? '');
  const text = typeof output === 'string' ? output : output.stderr;
  const d = text.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const duration = d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : MAX_SECONDS;
  return { duration: Math.min(duration, MAX_SECONDS) };
}

const size = async (p) => `${((await stat(p)).size / 1048576).toFixed(1)} Mo`;
const manifest = {};

for (const file of files) {
  const slug = basename(file, extname(file));
  const input = join(SRC, file);
  const { duration } = await probe(input);
  const vf = `scale=${WIDTH}:-2:flags=lanczos,fps=30`;
  const base = ['-y', '-v', 'error', '-t', String(MAX_SECONDS), '-i', input, '-an', '-vf', vf];

  console.log(`→ ${slug} (${duration.toFixed(1)} s)`);

  const mp4 = join(OUT, `${slug}.mp4`);
  await run(ffmpeg, [
    ...base,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    mp4,
  ]);

  const webm = join(OUT, `${slug}.webm`);
  await run(ffmpeg, [
    ...base,
    '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
    webm,
  ]);

  await run(ffmpeg, [
    '-y', '-v', 'error', '-ss', '0.5', '-i', input,
    '-frames:v', '1', '-vf', `scale=${WIDTH}:-2:flags=lanczos`,
    '-c:v', 'libwebp', '-quality', '78',
    join(OUT, `${slug}.webp`),
  ]);

  manifest[slug] = { duration: +duration.toFixed(2) };
  console.log(`  mp4 ${await size(mp4)} · webm ${await size(webm)}`);
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\n${files.length} vidéo(s) prête(s). Relancez le build pour les intégrer.`);
