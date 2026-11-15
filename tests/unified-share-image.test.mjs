import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import sharp from 'sharp';

const read = (path) => readFileSync(new URL(\`../\${path}\`, import.meta.url), 'utf8');
const ogAsset = 'public/og-lingxifield-20261115.jpg';
const miniAsset = 'miniapp/assets/share-lingxifield-20261115.jpg';

test('all website share metadata points to the 1200x630 global OG master', () => {
  const root = read('app/layout.tsx');
  const share = read('lib/share-image.ts');
  const sharePage = read('app/share/20260928/page.tsx');
  const siai = read('app/siai/page.tsx');
  const independentCard = read('lingxifield-ai-market/lib/share-card.ts');
  const miniShare = read('miniapp/utils/share.js');

  assert.ok(root.includes('SHARE_IMAGES') || root.includes('SHARE_IMAGE_URL'));
  assert.ok(share.includes('og-lingxifield-20261115.jpg'));
  assert.match(share, /width:\s*1200/);
  assert.match(share, /height:\s*630/);
  assert.ok(sharePage.includes('SHARE_IMAGE_URL'));
  assert.match(sharePage, /width=\{1200\}/);
  assert.match(sharePage, /height=\{630\}/);
  assert.ok(siai.includes('SHARE_IMAGES'));
  assert.ok(independentCard.includes('og-lingxifield-20261115.jpg'));
  assert.match(independentCard, /width:\s*1200/);
  assert.match(independentCard, /height:\s*630/);
  assert.ok(miniShare.includes('/assets/share-lingxifield-20261115.jpg'));
  assert.ok(!share.includes('og-lingxifield-20261113.jpg'));
  assert.ok(!independentCard.includes('og-lingxifield-20261113.jpg'));
});

test('website and miniapp use the exact same optimized 1200x630 JPEG', async () => {
  assert.ok(existsSync(ogAsset), 'website OG image must be committed');
  assert.ok(existsSync(miniAsset), 'miniapp share image must be committed');
  const ogBytes = readFileSync(ogAsset);
  const miniBytes = readFileSync(miniAsset);
  assert.deepEqual(miniBytes, ogBytes, 'miniapp must use the exact same OG artwork');
  const metadata = await sharp(ogBytes).metadata();
  assert.equal(metadata.format, 'jpeg');
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.ok(statSync(ogAsset).size < 150 * 1024);
  assert.ok(statSync(miniAsset).size < 150 * 1024);
  assert.ok(!existsSync('public/og-lingxifield-20261113.jpg'), 'retired OG image must stay deleted');
  assert.ok(!existsSync('miniapp/assets/share-lingxifield-20261105.jpg'), 'retired miniapp share image must stay deleted');
  const miniBuild = read('scripts/build-miniapps-v80.cjs');
  assert.ok(miniBuild.includes('assets/share-lingxifield-20261115.jpg'));
});
