import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('homepage FAQ uses a compact four-column desktop grid and responsive breakpoints', () => {
  const css = read('app/home-afternoon-20261114.css');
  const faq = css.slice(css.lastIndexOf('20261115: compact four-column FAQ'));
  assert.ok(faq.length > 0, 'four-column FAQ override must exist');
  assert.match(faq, /\.lx-home-reference \.lx-seo-question-grid\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(faq, /\.lx-home-faq-copy h3\{font-size:16px/);
  assert.match(faq, /\.lx-home-faq-copy p\{font-size:14px/);
  assert.match(faq, /@media\s*\(\s*max-width:\s*1180px\s*\)/);
  assert.match(faq, /@media\s*\(\s*max-width:\s*640px\s*\)/);
});

test('homepage body copy follows the Tools and SIAI 14px reading scale', () => {
  const css = read('app/home-afternoon-20261114.css');
  const scale = css.slice(css.lastIndexOf('20261115: homepage typography baseline'));
  assert.ok(scale.length > 0, 'homepage typography override must exist');
  assert.match(scale, /\.lx-home-growth-card>p[^}]*font-size:14px/);
  assert.match(scale, /\.lx-home-feature-copy small\{font-size:14px/);
  assert.match(scale, /\.lx-home-popular-tools p[^}]*font-size:14px/);
  assert.match(scale, /\.lx-home-faq-copy p\{font-size:14px/);
});

test('SIAI and Tools content rails use the shared 1600px responsive width', () => {
  const growth = read('app/growth-pages.css');
  const siai = growth.slice(growth.lastIndexOf('20261115: align the SIAI directory'));
  assert.match(siai, /width:min\(1600px,calc\(100% - 32px\)\)/);
  assert.match(siai, /max-width:1600px/);
  assert.match(siai, /padding-left:0!important/);
  const tools = read('app/tools/tools-hub-compact.css');
  assert.match(tools, /max-width:1600px!important/);
});

test('SASI market hero artwork preserves its natural ratio and is never stretched', () => {
  const css = read('components/SasiOpenMarketplace.module.css');
  assert.match(css, /\.main \.hero\{[^}]*aspect-ratio:3\s*\/\s*1/);
  assert.match(css, /\.main \.heroArtwork\{[^}]*object-fit:contain/);
});


test('homepage rightmost action is an account entry, not a duplicate recharge icon', () => {
  const nav = read('components/Nav.tsx');
  const start = nav.indexOf('<div className="lx11-top-actions">');
  const end = nav.indexOf('</div>', start);
  assert.ok(start >= 0 && end > start, 'homepage desktop action group must exist');
  const actions = nav.slice(start, end);
  assert.match(actions, /className="lx11-avatar lx11-account-trigger"/);
  assert.match(actions, /<Link href=\{rechargeHref\}[^>]*className="lx11-primary"/);
  const mobileStart = nav.indexOf('<div className="lx-home-mobile-actions">');
  const mobileEnd = nav.indexOf('</div>', mobileStart);
  assert.ok(mobileStart >= 0 && mobileEnd > mobileStart, 'homepage mobile action group must exist');
  const mobile = nav.slice(mobileStart, mobileEnd);
  assert.match(mobile, /className="lx11-mobile-account"/);
  assert.match(mobile, /LingxiMiniIcon name="account" size="nav"/);
  assert.doesNotMatch(mobile, /avatarUrl/);
});
