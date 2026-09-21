const fs = require('fs'), vm = require('vm'), ts = require('typescript'), assert = require('assert/strict'), sharp = require('sharp');
const m = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi/video-references.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText,
  { exports: m.exports, require: n => n === 'server-only' ? {} : require(n), Buffer });
let bytes, rows;
const id = '00000000-0000-4000-8000-000000000001';
const db = { from() { const filters = []; const q = { select() { return q; }, eq(k, v) { filters.push(r => r[k] === v); return q; }, in(k, v) { filters.push(r => v.includes(r[k])); return q; }, then(ok) { ok({ data: rows.filter(r => filters.every(f => f(r))) }); } }; return q; }, storage: { from() { return { download: async () => ({ data: new Blob([bytes]) }) }; } } };
(async () => {
  bytes = await sharp({ create: { width: 320, height: 320, channels: 3, background: '#00aabb' } }).png().toBuffer();
  rows = [{ id, user_id: 'alice', project_id: 'story-1', original_name: 'character.png', bucket_id: 'private', object_path: 'test', status: 'external_scan_required', verified_size: bytes.length }];
  const result = await m.exports.loadVideoReferences(db, 'alice', 'story-1', [id]);
  assert.ok(result[0].url.startsWith('data:image/jpeg;base64,')); assert.equal(result[0].sha256.length, 64);
  const image = await sharp(Buffer.from(result[0].url.split(',')[1], 'base64')).metadata(); assert.equal(image.format, 'jpeg'); assert.equal(image.exif, undefined);
  await assert.rejects(m.exports.loadVideoReferences(db, 'bob', 'story-1', [id]), /NOT_FOUND/);
  await assert.rejects(m.exports.loadVideoReferences(db, 'alice', 'story-2', [id]), /NOT_FOUND/);
  await assert.rejects(m.exports.loadVideoReferences(db, 'alice', 'story-1', [id, id]), /INVALID/);
  bytes = Buffer.from('<svg><script>alert(1)</script></svg>'); rows[0].verified_size = bytes.length;
  await assert.rejects(m.exports.loadVideoReferences(db, 'alice', 'story-1', [id]));
  rows[0].verified_size = 11 * 1024 * 1024;
  await assert.rejects(m.exports.loadVideoReferences(db, 'alice', 'story-1', [id]), /REVIEW/);
  console.log('PASS: real image decoding/re-encoding, metadata removal, cross-user/project rejection, duplicate rejection, disguised SVG and size boundary. No provider call.');
})().catch(e => { console.error(e); process.exitCode = 1; });
