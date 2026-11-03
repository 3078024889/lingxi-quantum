import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const ts=createRequire(import.meta.url)("typescript");
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {runInNewContext} from "node:vm";
const source=readFileSync(resolve("lib/tools/autonomous/media-type.ts"),"utf8");
const c=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};
runInNewContext(c,{module,exports:module.exports});
const {isLikelyVideoMediaFile,safeMediaExtension}=module.exports;
test("untyped MP4 and MOV are treated as video",()=>{
 for(const name of ["demo.MP4","demo.mov","movie.webm","movie.mkv"]){
  assert.equal(isLikelyVideoMediaFile({name,type:""}),true,name);
 }
});
test("audio MIME wins even when filename has video extension",()=>{
 assert.equal(isLikelyVideoMediaFile({name:"track.mp4",type:"audio/mp4"}),false);
 assert.equal(isLikelyVideoMediaFile({name:"sound.wav",type:""}),false);
 assert.equal(isLikelyVideoMediaFile({name:"anything.bin",type:"video/mp4"}),true);
});
test("FFmpeg virtual file extensions are strictly allowlisted",()=>{
 assert.equal(safeMediaExtension("movie.MP4"),"mp4");
 assert.equal(safeMediaExtension("track.flac"),"flac");
 assert.equal(safeMediaExtension("unexpected.html"),"bin");
 assert.equal(safeMediaExtension("../../evil.exe"),"bin");
 assert.equal(safeMediaExtension("name.mp4/x"),"bin");
});
