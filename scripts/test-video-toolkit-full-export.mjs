import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Native FFmpeg reference regression for the VideoToolkitWorkbench arguments.
// Verifies final exported bytes, duration, dimensions and complete decoding.
function run(bin,args){const p=spawnSync(bin,args,{encoding:'utf8',timeout:120000});if(p.error)throw p.error;assert.equal(p.status,0,p.stderr);return p.stdout.trim()}
function probe(file){const x=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',file]));return {duration:Number(x.format.duration),video:x.streams.find(s=>s.codec_type==='video'),audio:x.streams.find(s=>s.codec_type==='audio')}}
const root=mkdtempSync(join(tmpdir(),'lingxi-toolkit-full-'));
try{
 const input=join(root,'input.mp4');
 run('ffmpeg',['-v','error','-f','lavfi','-i','testsrc2=size=160x90:rate=25:duration=12','-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=12','-c:v','libx264','-c:a','aac','-shortest','-y',input]);
 const cases=[
  ['compress',['-i',input,'-c:v','libx264','-preset','veryfast','-crf','28','-c:a','aac','-b:a','128k'],12],
  ['trim',['-ss','3','-i',input,'-t','5','-c:v','libx264','-preset','veryfast','-c:a','aac'],5],
  ['mute',['-i',input,'-an','-c:v','libx264','-preset','veryfast'],12],
  ['convert',['-i',input,'-c:v','libx264','-preset','veryfast','-crf','24','-c:a','aac','-movflags','+faststart'],12],
  ['rotate90',['-i',input,'-vf','transpose=1','-c:v','libx264','-preset','veryfast','-c:a','copy'],12],
  ['rotate180',['-i',input,'-vf','hflip,vflip','-c:v','libx264','-preset','veryfast','-c:a','copy'],12],
  ['rotate270',['-i',input,'-vf','transpose=2','-c:v','libx264','-preset','veryfast','-c:a','copy'],12],
  ['speed2x',['-i',input,'-vf','setpts=0.5000*PTS','-filter:a','atempo=2.000','-c:v','libx264','-preset','veryfast','-c:a','aac'],6],
  ['speed0.5x',['-i',input,'-vf','setpts=2.0000*PTS','-filter:a','atempo=0.500','-c:v','libx264','-preset','veryfast','-c:a','aac'],24],
  ['audio',['-i',input,'-vn','-c:a','libmp3lame','-b:a','192k'],12]
 ];
 for(const [name,args,expected] of cases){
  const file=join(root,'output-'+name+(name==='audio'?'.mp3':'.mp4'));
  run('ffmpeg',['-hide_banner','-loglevel','error',...args,'-y',file]);
  assert.ok(statSync(file).size>1024,name+' empty output');
  const actual=probe(file);
  assert.ok(Math.abs(actual.duration-expected)<=Math.max(.4,expected*.04),name+' duration mismatch: '+actual.duration);
  if(name==='audio')assert.ok(actual.audio&&!actual.video);
  else assert.ok(actual.video);
  if(name==='mute')assert.ok(!actual.audio);
  if(name==='rotate90'||name==='rotate270')assert.equal(actual.video.width,90);
  run('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-']);
  console.log('TOOLKIT_EXPORT=PASS mode='+name+' actual='+actual.duration+'s');
 }
 console.log('VIDEO_TOOLKIT_REAL_OUTPUT_REGRESSION=PASS count='+cases.length);
}finally{rmSync(root,{recursive:true,force:true})}
