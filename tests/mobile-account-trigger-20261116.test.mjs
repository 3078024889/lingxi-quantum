import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const nav = readFileSync(new URL('../components/Nav.tsx', import.meta.url), 'utf8');

test('CN mobile homepage keeps recharge separate from the account entry', () => {
  const start = nav.indexOf('<header className="lx11-mobile lg:hidden lx-home-mobile">');
  const end = nav.indexOf('</header>', start);
  assert.ok(start >= 0 && end > start, 'mobile homepage header must exist');
  const header = nav.slice(start, end);
  assert.match(header, /<Link href="\/ai-wallet"[^>]*>💎<\/Link>/, 'recharge remains a diamond entry');
  assert.match(header, /className="lx11-mobile-account"[^>]*title=\{mt\.account\}/, 'account trigger remains accessible');
  assert.match(header, /<LingxiMiniIcon name="account" size="nav"\/>/, 'account trigger uses a person icon');
  assert.doesNotMatch(header, /className="lx11-mobile-account"[^>]*>\{avatarUrl\?/, 'avatar image cannot replace account icon');
  assert.match(header, /onClick=\{\(\)=>setMenuOpen\(value=>!value\)\}/, 'account menu interaction remains connected');
});
