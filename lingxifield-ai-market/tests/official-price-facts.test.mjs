import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const text=await readFile(new URL('../lib/reviewed-product-facts.ts',import.meta.url),'utf8');
test('ChatGPT Plus price fact links to primary help and explicitly separates API costs',()=>{
 assert.ok(text.includes('https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus'));
 assert.ok(text.includes('API 用量不包含在 Plus 内'));
});
test('Claude pricing connects to official help and preserves free-plan limitations',()=>{
 assert.ok(text.includes('https://support.claude.com/en/articles/11049762-choose-a-claude-plan'));
 assert.ok(text.includes('免费使用量有限'));
});
test('same-product price and regional facts are combined rather than overwritten',()=>{
 assert.ok(text.includes('for(const snapshot of relevant)Object.assign(facts,snapshot.facts)'));
 assert.ok(text.includes('observedAt:relevant[relevant.length-1].observedAt'));
});
