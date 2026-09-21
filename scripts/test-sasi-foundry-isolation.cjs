const fs = require('fs'), vm = require('vm'), ts = require('typescript'), assert = require('assert/strict');
const m = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi/cangxuan/load-series-context.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { exports: m.exports, require: n => n === 'server-only' ? {} : { resolveContinuityTimeline: rows => rows }, console });
const rows = [
  { id: 'other', user_id: 'alice', project_id: 'other-project', character_key: 'CAPTAIN', display_name: '他剧船长' },
  { id: 'global', user_id: 'alice', project_id: null, character_key: 'GLOBAL', display_name: '未绑定人物' },
  { id: 'owned', user_id: 'alice', project_id: 'target-project', character_key: 'MEI', display_name: '梅雨' },
  { id: 'foreign', user_id: 'bob', project_id: 'target-project', character_key: 'BOB', display_name: '另一用户' },
];
const db = { from: table => {
  const filters = []; const q = {
    select() { return q; }, order() { return q; }, limit() { return q; },
    eq(k, v) { filters.push(row => row[k] === v); return q; }, neq(k, v) { filters.push(row => row[k] !== v); return q; },
    in(k, values) { filters.push(row => values.includes(row[k])); return q; }, lte() { return q; },
    then(resolve) { resolve({ data: table === 'cangxuan_characters' ? rows.filter(row => filters.every(f => f(row))) : [] }); },
  }; return q;
} };
(async () => {
  const pack = await m.exports.loadDirectorFoundryPack(db, 'alice', { projectId: 'target-project' });
  assert.equal(pack.characters.length, 1); assert.equal(pack.characters[0].id, 'owned');
  const empty = await m.exports.loadDirectorFoundryPack(db, 'alice', { projectId: 'new-project' });
  assert.equal(empty.characters.length, 0, 'new project cannot inherit unrelated cast');
  assert.equal((await m.exports.loadDirectorFoundryPack(db, 'alice', { projectId: 'target-project', characterKeys: ['CAPTAIN'] })).characters.length, 0);
  console.log('PASS: same-user cross-project isolation, other-user isolation, unscoped cast exclusion, new-story empty state, character filter cannot bypass project.');
})().catch(e => { console.error(e); process.exitCode = 1; });
