// Only fixed filenames in an isolated, server-created directory enter the WASM FS.
const fs=require('node:fs'),path=require('node:path');
globalThis.self={location:{href:'file:///sasi-episode-assembly.js'}};
(async()=>{
 const directory=process.argv[2],count=Number(process.argv[3]);
 if(!directory||!Number.isInteger(count)||count<2||count>30)throw Error('ASSEMBLY_INPUT_INVALID');
 const create=require('@ffmpeg/core');
 const core=await create({wasmBinary:fs.readFileSync(path.join(path.dirname(require.resolve('@ffmpeg/core')),'ffmpeg-core.wasm'))});
 let bytes=0;
 for(let i=0;i<count;i++){
  const part=fs.readFileSync(path.join(directory,`part-${i}.mp4`));bytes+=part.length;
  if(part.length<12||bytes>100*1024*1024)throw Error('ASSEMBLY_LIMIT');
  core.FS.writeFile(`part-${i}.mp4`,part);
 }
 core.FS.writeFile('timeline.txt',Array.from({length:count},(_,i)=>`file 'part-${i}.mp4'`).join('\n'));
 core.setTimeout(60000);
 core.exec('-protocol_whitelist','file,pipe','-f','concat','-safe','1','-i','timeline.txt','-map','0:v:0','-map','0:a?','-c','copy','-metadata','comment=SASI AI-generated episode','-movflags','+faststart','episode.mp4');
 if(core.ret!==0)throw Error('ASSEMBLY_FAILED');
 const result=core.FS.readFile('episode.mp4');if(!result.length||result.length>100*1024*1024)throw Error('ASSEMBLY_LIMIT');
 fs.writeFileSync(path.join(directory,'episode.mp4'),result);
 console.log(JSON.stringify({assembled:true,clips:count,bytes:result.length}));
})().catch(()=>{console.error('ASSEMBLY_FAILED');process.exitCode=1});
