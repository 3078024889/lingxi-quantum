import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Native FFmpeg verification for the reverse-video speed range implemented in PR #37.
// Run: node scripts/test-video-reverse-audio-sync.mjs
function run(command,args){const p=spawnSync(command,args,{encoding:'utf8',timeout:90000});if(p.error)throw p.error;assert.equal(p.status,0,`${command} failed: ${p.stderr}`);return p.stdout.trim()}
function atempoChain(speed){let s=Math.max(.25,Math.min(10,speed)),parts=[];while(s>2){parts.push('atempo=2');s/=2}while(s<.5){parts.push('atempo=0.5');s/=0.5}parts.push('atempo='+s.toFixed(4));return parts.join(',')}
const dir=mkdtempSync(join(tmpdir(),'lingxi-reverse-'));
try{
 const input=join(dir,'input.mp4');
 run('ffmpeg',['-v','error','-f','lavfi','-i','testsrc2=size=160x90:rate=25:duration=2','-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=2','-c:v','libx264','-c:a','aac','-shortest','-y',input]);
 for(const speed of [.25,.5,1,2,4,10]){
  const out=join(dir,`output-${speed}.mp4`);
  const vf=speed===1?'reverse':`reverse,setpts=${(1/speed).toFixed(6)}*PTS`;
  const af=speed===1?'areverse':`areverse,${atempoChain(speed)}`;
  run('ffmpeg',['-v','error','-i',input,'-vf',vf,'-af',af,'-c:v','libx264','-c:a','aac','-y',out]);
  const probe=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,duration','-of','json',out]));
  const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
  assert.ok(v&&a,`missing video/audio at ${speed}x`);
  const vd=Number(v.duration),ad=Number(a.duration),expected=2/speed;
  assert.ok(Math.abs(vd-expected)<Math.max(.14,expected*.025),`video ${speed}x: ${vd} != ${expected}`);
  assert.ok(Math.abs(ad-vd)<Math.max(.14,expected*.025),`AV desync ${speed}x: video ${vd}, audio ${ad}`);
  run('ffmpeg',['-v','error','-xerror','-i',out,'-f','null','-']);
  console.log(`REVERSE_AV_CASE=PASS speed=${speed} video=${vd}s audio=${ad}s`);
 }
 console.log('REVERSE_AV_NATIVE_REGRESSION=PASS');
}finally{rmSync(dir,{force:true,recursive:true})}
