import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

test('SRT and WebVTT exports preserve numbers and punctuation in subtitle text', () => {
  const source = readFileSync(new URL('../lib/tools/media/video-translate-client.ts', import.meta.url), 'utf8');
  const {outputText} = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}});
  const exports = {};
  runInNewContext(outputText, {exports, require: () => ({})});
  const cue = {start:1.125,end:3.25,text:'Accounts: 1,234\n2026\n123,45'};
  assert.equal(exports.toSrtTimed([cue]), '1\n00:00:01,125 --> 00:00:03,250\n'+cue.text);
  assert.equal(exports.toVttTimed([cue]), 'WEBVTT\n\n00:00:01.125 --> 00:00:03.250\n'+cue.text);
});
