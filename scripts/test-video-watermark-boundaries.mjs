import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
// Native FFmpeg test of the same delogo boundary math used by VideoWatermarkWorkbench.
// Run: node scripts/test-video-watermark-boundaries.mjs
function exec(bin,args){const p=spawnSync(bin,args,{encoding:"utf8",timeout:60000});if(p.error)throw p.error;assert.equal(p.status,0,p.stderr);return p.stdout.trim()}
const root=mkdtempSync(join(tmpdir(),"lingxi-watermark-"));
try{
 for(const [w,h] of [[160,90],[64,64],[32,32]]){
  const input=join(root,`input-${w}.mp4`);
  exec("ffmpeg",["-hide_banner","-loglevel","error","-f","lavfi","-i",`testsrc2=size=${w}x${h}:rate=12:duration=2`,"-c:v","libx264","-pix_fmt","yuv420p","-y",input]);
  for(const [name,box] of [["center",{x:40,y:40,w:20,h:20}],["right-bottom",{x:95,y:95,w:20,h:20}],["top-left",{x:0,y:0,w:20,h:20}]]){
   const px=Math.max(1,Math.min(w-10,Math.round(w*box.x/100))),py=Math.max(1,Math.min(h-10,Math.round(h*box.y/100)));
   const pw=Math.min(w-px-1,Math.max(8,Math.round(w*box.w/100))),ph=Math.min(h-py-1,Math.max(8,Math.round(h*box.h/100)));
   assert.ok(px>=1&&py>=1&&pw>=8&&ph>=8&&px+pw<w&&py+ph<h);
   const out=join(root,`output-${w}-${name}.mp4`);
   exec("ffmpeg",["-hide_banner","-loglevel","error","-i",input,"-vf",`delogo=x=${px}:y=${py}:w=${pw}:h=${ph}:show=0`,"-c:v","libx264","-pix_fmt","yuv420p","-y",out]);
   const info=JSON.parse(exec("ffprobe",["-v","error","-show_entries","format=duration:stream=width,height","-of","json",out]));
   assert.equal(info.streams[0].width,w);assert.equal(info.streams[0].height,h);
   assert.ok(Math.abs(Number(info.format.duration)-2)<0.2);
   exec("ffmpeg",["-v","error","-xerror","-i",out,"-f","null","-"]);
   console.log(`WATERMARK_CASE=PASS ${w}x${h} ${name}`);
  }
 }
 console.log("WATERMARK_OUTPUT_DECODE_REGRESSION=PASS");
}finally{rmSync(root,{recursive:true,force:true})}
