// Isolated process: the existing single-thread WASM core only sees an in-memory file.
const fs=require('node:fs'),path=require('node:path');
globalThis.self={location:{href:'file:///sasi-media-verification.js'}};
(async()=>{
 const bytes=fs.readFileSync(process.argv[2]);
 if(bytes.length<12||bytes.length>100*1024*1024)throw Error('VIDEO_SIZE_INVALID');
 const create=require('@ffmpeg/core');
 const core=await create({wasmBinary:fs.readFileSync(path.join(path.dirname(require.resolve('@ffmpeg/core')),'ffmpeg-core.wasm'))});
 let width=0,height=0,frames=0;
 core.setLogger(({message})=>{if(message.includes('Video:')){const hit=message.match(/\b(\d{2,5})x(\d{2,5})\b/);if(hit){width=Number(hit[1]);height=Number(hit[2])}}const frame=message.match(/\bframe=\s*(\d+)/);if(frame)frames=Math.max(frames,Number(frame[1]));});
 core.FS.writeFile('input.mp4',bytes);core.setTimeout(40000);
 core.exec('-v','info','-xerror','-threads','1','-i','input.mp4','-map','0:v:0','-an','-f','null','-');
 const ret=core.ret;core.FS.unlink('input.mp4');core.reset();
 if(ret!==0||!width||!height||frames<2)throw Error('VIDEO_DECODE_INVALID');
 console.log(JSON.stringify({width,height,frames,decoded:true}));
})().catch(()=>{console.error('VIDEO_DECODE_INVALID');process.exitCode=1});
