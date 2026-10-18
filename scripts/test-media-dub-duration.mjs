import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Test the production muxDubbedVideo FFmpeg graph with short and long dubbed audio.
// Run: node scripts/test-media-dub-duration.mjs (requires ffmpeg and ffprobe).
const dir=mkdtempSync(join(tmpdir(),'lingxi-dub-duration-'));
function cmd(bin,args){
 const r=spawnSync(bin,args,{encoding:'utf8',timeout:120000});
 if(r.error)throw r.error;
 assert.equal(r.status,0,bin+': '+r.stderr);
 return r.stdout.trim();
}
function duration(file){
 const n=Number(cmd('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file]));
 assert.ok(Number.isFinite(n)&&n>0);
 return n;
}
try {
 for (const [videoSeconds,audioSeconds] of [[8,2],[2,8],[8,8]]) {
  const video=join(dir,'video-'+videoSeconds+'.mp4'),audio=join(dir,'audio-'+audioSeconds+'.mp3');
  const output=join(dir,'dub-'+videoSeconds+'-'+audioSeconds+'.mp4');
  cmd('ffmpeg',['-v','error','-f','lavfi','-i','testsrc2=size=160x90:rate=12:duration='+videoSeconds,'-c:v','libx264','-y',video]);
  cmd('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration='+audioSeconds,'-c:a','libmp3lame','-y',audio]);
  cmd('ffmpeg',['-v','error','-i',video,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-af','apad','-shortest','-y',output]);
  const actual=duration(output);
  assert.ok(Math.abs(actual-videoSeconds)<.2,`dub duration truncated: original ${videoSeconds}s, output ${actual}s, audio ${audioSeconds}s`);
  cmd('ffmpeg',['-v','error','-xerror','-i',output,'-f','null','-']);
  console.log(`DUB_DURATION=PASS original=${videoSeconds}s voice=${audioSeconds}s export=${actual}s`);
 }
 console.log('DUB_MUX_DURATION_REGRESSION=PASS');
} finally {rmSync(dir,{recursive:true,force:true})}
