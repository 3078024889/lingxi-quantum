import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import minimatchModule from 'minimatch';

const match = typeof minimatchModule === 'function' ? minimatchModule : minimatchModule.minimatch;
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const rules = config.git.deploymentEnabled;
const deploys = branch => Object.entries(rules).some(([pattern, enabled]) => enabled && match(branch, pattern)) ||
  !Object.keys(rules).some(pattern => match(branch, pattern));
assert.equal(deploys('main'), true);
for (const branch of ['dev', 'feat/r33-tools', 'codex/fix', 'audit/check', 'release/v6']) assert.equal(deploys(branch), false);
assert.deepEqual(config.crons.map(row => row.path), ['/api/cron/privacy-cleanup', '/api/cron/withdrawal-reconcile', '/api/cron/sasi-v5-radar']);

let authCalls = 0;
const exports = {};
class ResponseMock {
  constructor(body, init = {}) { this.body = body; this.status = init.status ?? 200; this.headers = new Headers(init.headers); }
  static next() { return new ResponseMock('next'); }
  static redirect(url, status) { return new ResponseMock(url.toString(), { status }); }
}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('middleware.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  exports, console, Headers,
  process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test' } },
  // The mocked timeout doesn't allocate timers; auth resolves immediately.
  setTimeout() {},
  require(name) {
    if (name === 'next/server') return { NextResponse: ResponseMock };
    if (name === '@/lib/seo/indexing') return { privateSearchPath: path => path.startsWith('/account') };
    if (name === '@supabase/ssr') return { createServerClient() { return { auth: { async getUser() { authCalls++; } } }; } };
    throw new Error(`Unexpected dependency: ${name}`);
  },
});
function request(path, cookies = [], host = 'lingxifield.cn') {
  const url = new URL(`https://${host}${path}`);
  url.clone = () => new URL(url);
  return { headers: new Headers({ host }), nextUrl: url, cookies: { getAll: () => cookies, set() {} } };
}
for (const cookies of [[], [{ name: 'language', value: 'zh' }], [{ name: 'sb-test-auth-token-code-verifier', value: 'proof' }]]) {
  const result = await exports.middleware(request('/tools', cookies));
  assert.equal(result.status, 200);
  assert.match(result.headers.get('link'), /lingxifield\.com\/tools/);
}
assert.equal(authCalls, 0, 'Guests and OAuth verifier alone must not start session refresh');
for (const name of ['sb-example-auth-token', 'sb-example-auth-token.0', 'sb-example-auth-token.1']) {
  await exports.middleware(request('/account', [{ name, value: 'session-must-be-verified' }]));
}
assert.equal(authCalls, 3, 'Every session and chunked session must still be verified');
assert.equal((await exports.middleware(request('/account'))).headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
assert.equal((await exports.middleware(request('/membership'))).status, 410);
assert.equal((await exports.middleware(request('/tools', [], 'www.lingxifield.cn'))).status, 308);
await exports.middleware(request('/api/account/money-admin'));
assert.equal(authCalls, 3, 'API routes retain their own authentication checks');
console.log('Vercel branch policy and middleware guest/session regression: PASS');
