import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';

const require=createRequire(import.meta.url);
const ts=require('typescript');
const path=resolve(process.cwd(),'lib/tools/autonomous/subtitle-format.ts');
const content=readFileSync(path,'utf8');
const compiled=ts.transpileModule(content,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};
runInNewContext(compiled,{module,exports:module.exports},{filename:path});
const {toSrt,toVtt}=module.exports;

test('SRT uses comma timestamps and preserves transcript punctuation',()=>{
 const actual=toSrt([{start:1.234,end:4.567,text:'Hello, world. 12,345 users.'}]);
 assert.equal(actual,'1\n00:00:01,234 --> 00:00:04,567\nHello, world. 12,345 users.');
});

test('WebVTT changes timestamp syntax only, never transcription punctuation',()=>{
 const actual=toVtt([{start:1.234,end:4.567,text:'Hello, world. 12,345 users.'},{start:60,end:61.2,text:'欢迎, أهلاً, Bonjour'}]);
 assert.equal(actual,'WEBVTT\n\n00:00:01.234 --> 00:00:04.567\nHello, world. 12,345 users.\n\n00:01:00.000 --> 00:01:01.200\n欢迎, أهلاً, Bonjour');
 assert.ok(!actual.includes('\n1\n'));
});

test('number-only transcribed lines remain visible in VTT',()=>{
 const output=toVtt([{start:0,end:1,text:'2026\n12,345'}]);
 assert.ok(output.includes('\n2026\n12,345'));
});

test('empty speech emits only WebVTT header and no fabricated words',()=>{
 assert.equal(toSrt([]),'');
 assert.equal(toVtt([]),'WEBVTT\n\n');
});

test('timestamp formatting safely clamps out-of-range and nonfinite times',()=>{
 const actual=toVtt([{start:-10,end:NaN,text:'Safe, text'},{start:3661.999,end:3662.5,text:'Hours'}]);
 assert.ok(actual.includes('00:00:00.000 --> 00:00:00.000'));
 assert.ok(actual.includes('01:01:01.999 --> 01:01:02.500'));
});
