import {test,expect} from "./export-test";
import {planVoiceDurationFit} from "../../lib/tools/media/voice-duration-plan";
import {spawnSync} from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
test("real FFmpeg produces decodable MP3 with accurate video-length tempo fit",async()=>{
 test.setTimeout(45000);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"lingxi-voice-fit-"));
 const source=path.join(dir,"voice.mp3"),output=path.join(dir,"fit.mp3");
 const run=(cmd:string,args:string[])=>{
  const result=spawnSync(cmd,args,{encoding:"utf8",timeout:20000});
  expect(result.status,cmd+" failure: "+result.stderr).toBe(0);
  return (result.stdout||"").trim();
 };
 const duration=(file:string)=>Number(run("ffprobe",["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",file]));
 try{
  run("ffmpeg",["-hide_banner","-loglevel","error","-y","-f","lavfi","-i","sine=frequency=440:sample_rate=16000:duration=4.2","-c:a","libmp3lame",source]);
  const start=duration(source);
  expect(start).toBeGreaterThan(4);
  const target=3.2,plan=planVoiceDurationFit(start,target);
  expect(plan.needsFit).toBe(true);
  run("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",source,"-vn","-af",plan.filter,"-t",String(target),"-ar","44100","-c:a","libmp3lame","-b:a","160k",output]);
  expect(duration(output)).toBeGreaterThan(target-.23);
  expect(duration(output)).toBeLessThan(target+.23);
  const stat=await fs.stat(output);expect(stat.size).toBeGreaterThan(10000);
 }finally{await fs.rm(dir,{recursive:true,force:true})}
});
