const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('lib/supabase/server.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
(async () => {
  for (const asynchronous of [false, true]) {
    const written = [];
    const store = { getAll: () => [{ name: 'session', value: 'test' }], set: (...args) => written.push(args) };
    const module = { exports: {} };
    vm.runInNewContext(source, {
      exports: module.exports,
      process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key-not-a-real-secret' } },
      URL, console,
      require: name => name === 'next/headers' ? { cookies: () => asynchronous ? Promise.resolve(store) : store } :
        { createServerClient: (_url, _key, options) => options.cookies },
    });
    const adapter = module.exports.createClient();
    assert.equal((await adapter.getAll())[0].value, 'test');
    await adapter.setAll([{ name: 'session', value: 'refreshed', options: { httpOnly: true } }]);
    assert.equal(written[0][1], 'refreshed');
    assert.equal(written[0][2].httpOnly, true);
  }
  console.log('PASS: cookie read/write preserves options with synchronous and asynchronous cookie stores.');
})().catch(error => { console.error(error); process.exitCode = 1; });
