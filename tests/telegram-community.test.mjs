import test from 'node:test';
import assert from 'node:assert/strict';
import { commandReply, dailyPost, isAllowedGroup, isClearSpam, marketingLink, singaporeDate, validWebhookSecret, welcomeText } from '../lib/telegram/community.ts';

test('posts are branded, action-oriented and track source', () => {
  for (let i = 1; i <= 7; i++) {
    const post = dailyPost(new Date(`2026-11-${String(i).padStart(2,'0')}T04:00:00.000Z`));
    assert.match(post, /全球 SIAI/);
    assert.match(post, /utm_source=telegram/);
    assert.match(post, /https:\/\//);
    assert.ok(post.length < 4096);
  }
});
test('daily posts always use the Singapore date', () => {
  assert.equal(singaporeDate(new Date('2026-11-05T23:30:00.000Z')), '2026-11-06');
});
test('commands and welcome messages have valid links', () => {
  assert.match(commandReply('/ranking@GlobalSIAI_OfficialBot'), /utm_campaign=command_ranking/);
  assert.match(commandReply('/tools'), /utm_campaign=command_tools/);
  assert.match(welcomeText(), /lingxifield\.com/);
  assert.equal(commandReply('/unknown'), null);
});
test('groups and private messages are not confused', () => {
  assert.equal(isAllowedGroup({ id: -10022, type: 'supergroup', username: 'globalsiai' }, '@globalsiai'), true);
  assert.equal(isAllowedGroup({ id: -10022, type: 'supergroup', username: 'othergroup' }, '@globalsiai'), false);
  assert.equal(isAllowedGroup({ id: 42, type: 'private' }, '42'), false);
});
test('moderation does not reject ordinary URLs or discussion', () => {
  assert.equal(isClearSpam('我想试试 https://example.com'), false);
  assert.equal(isClearSpam('了解Web3和空投'), false);
  assert.equal(isClearSpam('稳赚不赔领取收益 https://malicious.example'), true);
});
test('webhook auth requires a nontrivial exact secret', () => {
  assert.equal(validWebhookSecret('abc', 'abc'), false);
  assert.equal(validWebhookSecret('abcdefghijklmnop', 'abcdefghijklmnop'), true);
  assert.equal(validWebhookSecret('abcdefghijklmnop', 'abcdefghijklmnopZ'), false);
});
test('tracking preserves existing query strings', () => {
  const url = new URL(marketingLink('https://lingxifield.com/tools?tab=pdf', 'welcome'));
  assert.equal(url.searchParams.get('tab'), 'pdf');
  assert.equal(url.searchParams.get('utm_campaign'), 'welcome');
});
