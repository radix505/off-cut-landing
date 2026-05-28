// Render the OFF CUT wordmark (bearded-head icon + "OFF CUT" in Let Me Ride)
// into transparent PNGs for use as inline email attachments.
//
// Two variants are produced:
//   wordmark-dark.png  - ink-coloured, for the paper header
//   wordmark-light.png - paper-coloured, for the ink footer
//
// Output lives next to this script. Rerun whenever the font, icon, or
// composition changes:
//
//   node server/mail/assets/build-logos.mjs
//
// The mailer reads these PNGs at startup and ships them as CID-attached
// inline images (works in every client including Outlook desktop).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..', '..', '..');
const fontPath = resolve(projectRoot, 'public', 'fonts', 'LetMeRide.woff2');
const logoSvgPath = resolve(projectRoot, 'public', 'logo.svg');
mkdirSync(here, { recursive: true });

const fontBase64 = readFileSync(fontPath).toString('base64');
const logoSvgRaw = readFileSync(logoSvgPath, 'utf8');

// Pull out the <g>…</g> body from the source SVG so we can recompose it at
// a known viewBox/size with our own colour.
const gMatch = logoSvgRaw.match(/<g[\s\S]*?<\/g>/);
if (!gMatch) throw new Error('Could not extract <g> from logo.svg');
const logoGroup = gMatch[0].replace(/fill="[^"]*"/g, 'fill="currentColor"');

// Source viewBox is roughly 174×357 (portrait). Render the icon as a tight
// portrait next to the wordmark.
const ICON_VIEWBOX = '0 0 174.07784 356.99506';

function htmlFor(color) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8" />
<style>
@font-face {
  font-family: 'Let Me Ride';
  src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
  font-display: block;
}
html, body { margin: 0; padding: 0; background: transparent; }
body {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 18px 22px;
}
.mark {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  color: ${color};
}
.mark-icon {
  width: 32px;
  height: 66px;
  flex-shrink: 0;
}
.mark-text {
  font-family: 'Let Me Ride', 'Bebas Neue', sans-serif;
  font-size: 64px;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
}
</style>
</head><body>
<span class="mark">
  <svg class="mark-icon" viewBox="${ICON_VIEWBOX}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    ${logoGroup}
  </svg>
  <span class="mark-text">OFF CUT</span>
</span>
</body></html>`;
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function renderToPng({ html, outPath, width, height }) {
  const tmpHtml = resolve(tmpdir(), `offcut-mark-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(tmpHtml, html);
  // device-scale-factor=2 doubles the bitmap resolution while keeping the
  // logical layout identical, so the result stays sharp when downscaled to
  // ~200px wide in a retina mail client.
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--default-background-color=00000000',
    '--force-device-scale-factor=2',
    `--window-size=${width},${height}`,
    `--screenshot=${outPath}`,
    `file://${tmpHtml}`,
  ], { stdio: 'pipe' });
}

const variants = [
  { name: 'wordmark-dark.png',  color: '#0a0a0a' },
  { name: 'wordmark-light.png', color: '#fcfaf6' },
];

// Rendered window is sized to fit the wordmark with just a hair of inset.
// Width was tuned empirically: 32px icon + 20px gap + "OFF CUT" rendered
// at 64px Let Me Ride ≈ 460px, plus 28px padding either side.
const RENDER_W = 520;
const RENDER_H = 120;

for (const v of variants) {
  const out = resolve(here, v.name);
  renderToPng({ html: htmlFor(v.color), outPath: out, width: RENDER_W, height: RENDER_H });
  console.log(`rendered ${v.name}`);
}

console.log('done');
