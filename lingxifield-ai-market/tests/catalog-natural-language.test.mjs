import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverCatalog} from '../lib/catalog-insights.mjs';
import {readFile} from 'node:fs/promises';
const rows=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
test('Chinese user problem: offline private model',()=>{
 const r=discoverCatalog(rows,'我想在本地离线使用AI，不上传隐私数据');
 assert.ok(r.matched>0);assert.ok(r.items.some(x=>x.id==='ollama'||x.id==='llamacpp'));
});
test('English document retrieval finds tool candidates',()=>{
 const r=discoverCatalog(rows,'I need PDF document search and RAG');
 assert.ok(r.items.some(x=>x.id==='llamaindex'||x.id==='langchain'));
});
test('voice transcription finds open-source transcription candidates',()=>{
 const r=discoverCatalog(rows,'Can I transcribe voice recordings?');
 assert.ok(r.items.some(x=>x.id==='whisper'||x.id==='fasterwhisper'));
});
test('candidate suggestions never claim independently verified market rank',()=>{
 const r=discoverCatalog(rows,'image');
 assert.match(r.notice,/not evidence-based performance rankings/);
 assert.ok(r.items.every(x=>['unverified','active'].includes(x.status))); // Active listing never implies audited ranking.
 assert.ok(!('rank' in r.items[0]));
});
