const fs = require('fs'), vm = require('vm'), ts = require('typescript'), assert = require('node:assert/strict');
function load(path, imports, extra = {}) {
  const m = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports: m.exports, require: n => n === 'server-only' ? {} : n in imports ? imports[n] : require(n), URL, AbortSignal, process: { env: {} }, ...extra });
  return m.exports;
}
const calls = [];
let response = { ok: true, json: async () => ({ id: 'task-fixture-123' }) };
const adapter = load('lib/sasi/seedance-byok.ts', {}, { fetch: async (...args) => { calls.push(args); return response; } });
const profile = { model: 'fixture-seedance', resolution: '720p', generateAudio: true, maxDuration: 12, estimatedFenPerSecond: 10,
  validUntil: new Date(Date.now() + 3600000).toISOString(), priceSource: 'https://www.volcengine.com/docs/82379/1544106' };
const userId = '00000000-0000-4000-8000-000000000001', projectId = '00000000-0000-4000-8000-000000000002', taskId = '00000000-0000-4000-8000-000000000003';
let submitCount = 0, authenticated = true, sameOrigin = true;
let task = { id: taskId, user_id: userId, project_id: projectId, state: 'quoted', request: { model: profile.model, prompt: 'fixture narrative' },
  profile_version: adapter.seedanceProfileVersion(profile), memory_version: 'memory-1', key_fingerprint: 'fingerprint', expires_at: profile.validUntil };
const db = {
  rpc: async () => ({ data: true }),
  from(table) {
    assert.ok(['sasi_byok_video_tasks', 'sasi_provider_connections', 'sasi_projects'].includes(table), 'must not touch wallet');
    const filters = []; let update;
    const q = {
      select() { return q; }, eq(k, v) { filters.push([k, v]); return q; }, in(k, v) { filters.push([k, v]); return q; },
      update(v) { update = v; return q; },
      async maybeSingle() { return execute(); }, then(ok, fail) { return Promise.resolve().then(execute).then(ok, fail); },
    };
    function execute() {
      assert.ok(filters.some(([k, v]) => k === 'user_id' && v === userId), 'all queries owner scoped');
      if (table === 'sasi_provider_connections') return { data: { encrypted_credential: 'ciphertext', fingerprint: 'fingerprint', health_status: 'healthy' } };
      if (table === 'sasi_projects') return { data: { id: projectId } };
      const match = task && filters.every(([k, v]) => Array.isArray(v) ? v.includes(task[k]) : task[k] === v);
      if (!match) return { data: null };
      if (update) task = { ...task, ...update };
      return { data: { ...task } };
    }
    return q;
  },
};
let shouldTimeout = false;
const routes = load('app/api/sasi/byok/video/route.ts', {
  'next/server': { NextResponse: { json: (body, init) => ({ body, status: init.status }) } },
  '@/lib/supabase/server': { createClient: () => ({ auth: { getUser: async () => ({ data: { user: authenticated ? { id: userId } : null } }) } }) },
  '@/lib/supabase/admin': { createAdminClient: () => db },
  '@/lib/sasi/credential-vault': { decryptProviderKey: (u, p, value) => { assert.equal(u, userId); assert.equal(p, 'volcengine'); assert.equal(value, 'ciphertext'); return 'owner-key'; } },
  '@/lib/sasi/request-security': { isSameOriginMutation: () => sameOrigin },
  '@/lib/sasi/safety': { reviewSasiProductionInput: () => ({ ok: true }) },
  '@/lib/sasi/load-project-memory': { loadProjectMemory: async () => ({ version: 'memory-1', active: [] }) },
  '@/lib/sasi/video-references': { loadVideoReferences: async () => [] },
  '@/lib/sasi/seedance-byok': { ...adapter, seedanceProfile: () => profile, submitSeedanceByok: async (key) => {
    assert.equal(key, 'owner-key'); submitCount++; await new Promise(r => setTimeout(r, 5));
    if (shouldTimeout) throw new Error('timeout'); return 'task-fixture-123';
  } },
}, { process: { env: { SASI_BYOK_VIDEO_ENABLED: 'true' } } });
const request = (body) => ({ json: async () => body });
const confirm = () => routes.POST(request({ action: 'confirm', taskId, acceptSupplierBilling: true }));
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
  sameOrigin = false; assert.equal((await confirm()).status, 403); sameOrigin = true;
  authenticated = false; assert.equal((await confirm()).status, 401); authenticated = true;
  assert.equal((await routes.POST(request({ action: 'confirm', taskId }))).status, 422);
  task.memory_version = 'older'; assert.equal((await confirm()).status, 409); task.memory_version = 'memory-1';
  await Promise.all([confirm(), confirm()]); assert.equal(submitCount, 1); assert.equal(task.state, 'queued');
  await confirm(); assert.equal(submitCount, 1, 'repeat approval cannot spend twice');
  task.state = 'quoted'; task.provider_task_id = null; shouldTimeout = true;
  assert.equal((await confirm()).status, 409); assert.equal(task.state, 'uncertain');
  await confirm(); assert.equal(submitCount, 2, 'uncertain submission must not retry');
  console.log('PASS: owner-key transport, redacted errors, pricing validation, source/expiry, auth, origin, approval, memory version, concurrent claims, timeout non-retry. Fixtures only; no paid API call.');
})().catch(e => { console.error(e); process.exitCode = 1; });
