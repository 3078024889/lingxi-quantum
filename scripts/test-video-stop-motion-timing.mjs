/** Native FFmpeg regression of VideoEffectsWorkbench stop-motion timing.
 * Run: node scripts/test-video-stop-motion-timing.mjs
 * Requires ffmpeg and ffprobe on PATH.
 * Browser FFmpeg.wasm and mobile compatibility require separate E2E tests.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(command, args) {
 const result = spawnSync(command, args, { encoding: 'utf8', timeout: 60000 });
 if (result.error) throw result.error;
 assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
 return result.stdout.trim();
}
function probe(file) {
 const metadata = JSON.parse(run('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,r_frame_rate:format=duration','-of','json',file]));
 return {duration:Number(metadata.format.duration),frames:Number(metadata.streams[0].nb_frames)};
}
const root = mkdtempSync(join(tmpdir(),'lingxi-stop-motion-'));
try {
 const input=join(root,'input.mp4');
 run('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=160x90:rate=25:duration=4','-c:v','mpeg4','-y',input]);
 for(const interval of [0.2,0.4,1]) for(const fps of [6,12,24]){
  const out=join(root,`out-${interval}-${fps}.mp4`);
  const sample=`fps=1/${interval},setpts=N*${interval}/TB`;
  run('ffmpeg',['-hide_banner','-loglevel','error','-i',input,'-vf',sample,'-an','-r',String(fps),'-c:v','libx264','-pix_fmt','yuv420p','-y',out]);
  const p=probe(out);
  assert.ok(Number.isFinite(p.duration)&&p.duration>0,`invalid duration: ${interval}/${fps}`);
  assert.ok(p.frames>0,`empty frames: ${interval}/${fps}`);
  assert.ok(Math.abs(p.duration-4)<=Math.max(0.22,interval+1/fps),`duration drift: ${interval}/${fps} => ${p.duration}`);
  console.log(`STOP_MOTION_CASE=PASS interval=${interval}s fps=${fps} duration=${p.duration}s frames=${p.frames}`);
 }
 console.log('STOP_MOTION_NATIVE_FFMPEG_REGRESSION=PASS');
}finally{rmSync(root,{recursive:true,force:true});}
