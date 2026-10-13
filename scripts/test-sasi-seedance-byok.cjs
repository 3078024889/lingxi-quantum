const fs = require('fs'), vm = require('vm'), ts = require('typescript'), assert = require('node:assert/strict');
function load(path, imports, extra = {}) {
  const m = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports: m.exports, require: n => n === 'server-only' ? {} : n === '@/lib/sasi/intelligence/video-actions' ? load('lib/sasi/intelligence/video-actions.ts',imports,extra) : n === './function-options' ? load('lib/sasi/function-options.ts',{}) : n in imports ? imports[n] : require(n), URL, AbortSignal, process: { env: {} }, ...extra });
  return m.exports;
}
const calls = [];
let response = { ok: true, json: async () => ({ id: 'task-fixture-123' }) };
const adapter = load('lib/sasi/seedance-byok.ts', {}, { fetch: async (...args) => { calls.push(args); return response; } });
const profile = { model: 'fixture-seedance', resolution: '720p', generateAudio: true, maxDuration: 12, estimatedFenPerSecond: 10,
  validUntil: new Date(Date.now() + 3600000).toISOString(), priceSource: 'https://www.volcengine.com/docs/82379/1544106' };
(async () => {
  assert.equal(adapter.seedanceProfile(undefined), null);
  for (const patch of [{ model: 123 }, { estimatedFenPerSecond: 0 }, { estimatedFenPerSecond: 1.2 }, { maxDuration: 100 }, { priceSource: 'https://attacker.test' }, { validUntil: '2000-01-01' }])
    assert.equal(adapter.seedanceProfile(JSON.stringify({ ...profile, ...patch })), null);
  assert.ok(adapter.seedanceProfile(JSON.stringify(profile)));
  const input = { model: profile.model, prompt: 'camera follows a paper boat', duration: 8, ratio: '9:16', resolution: '720p', generateAudio: true };
  assert.equal(await adapter.submitSeedanceByok('private-owner-key', input), 'task-fixture-123');
  assert.equal(calls[0][0], 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks');
  assert.equal(calls[0][1].headers.Authorization, 'Bearer private-owner-key');
  assert.equal(JSON.parse(calls[0][1].body).watermark, true);
  response = { ok: false, status: 401, json: async () => ({ error: 'private-owner-key' }) };
  await assert.rejects(adapter.submitSeedanceByok('private-owner-key', input), /^Error: ARK_HTTP_401$/);
  response = { ok: true, json: async () => ({ status: 'succeeded', content: { video_url: 'https://result.example/video.mp4' }, usage: { total_tokens: 123 } }) };
  assert.equal((await adapter.pollSeedanceByok('private-owner-key', 'task-fixture-123')).output.totalTokens, 123);
  await assert.rejects(adapter.pollSeedanceByok('key', '../tasks/escape'), /INVALID_TASK/);
  console.log('PASS: Seedance owner-key transport, redacted errors, profile pricing/expiry validation, task path rejection. Submission ownership, concurrent claims and uncertain recovery are covered by test-video-reference-claim.cjs. Fixtures only.');
})().catch(e => { console.error(e); process.exitCode = 1; });
