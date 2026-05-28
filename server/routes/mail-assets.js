import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream, statSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(here, '..', 'mail', 'assets');

// Email wordmark assets are served straight off disk from server/mail/assets
// so they are always available, independent of the Vite build / dist glob
// pipeline used by @fastify/static. Inline-CID delivery is unreliable in
// Gmail (the src= attribute gets stripped), so the email template references
// these PNGs by hosted HTTPS URL instead.
const ALLOWED = new Set(['wordmark-dark.png', 'wordmark-light.png']);

export default async function mailAssetsRoutes(fastify) {
  fastify.get('/email/:filename', async (req, reply) => {
    const { filename } = req.params;
    if (!ALLOWED.has(filename)) {
      return reply.code(404).send({ error: 'not_found' });
    }
    const filePath = resolve(ASSETS_DIR, filename);
    let stat;
    try {
      stat = statSync(filePath);
    } catch (err) {
      // Most likely the PNG wasn't shipped in the container (it's matched
      // by the global *.png .gitignore rule unless the wordmark-*.png
      // exception is in place). Log and 404 so Gmail just shows the alt
      // text instead of a 500 page.
      req.log.error({ err, filePath }, 'mail asset missing on disk');
      return reply.code(404).send({ error: 'not_found' });
    }
    return reply
      .type('image/png')
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('Content-Length', String(stat.size))
      .send(createReadStream(filePath));
  });
}
