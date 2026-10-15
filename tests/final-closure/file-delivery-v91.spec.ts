import {test,expect,type Page} from './export-test';
import sharp from 'sharp';
import fs from 'node:fs/promises';
async function prepare(page:Page,outcome:string){
 await page.addInitScript(mode=>{
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>mode!=='unsupported'});
  Object.defineProperty(navigator,'share',{configurable:true,value:async(data:ShareData)=>{
   (window as any).__handoff={name:data.files?.[0].name,type:data.files?.[0].type,size:data.files?.[0].size,active:navigator.userActivation.isActive};
   if(mode==='cancelled')throw new DOMException('cancel','AbortError');
   if(mode==='failed')throw new DOMException('target rejected','DataError');
  }});
 },outcome);
 let uploads=0;await page.route('**/api/tools/mobile-file',route=>{uploads++;return route.fulfill({status:401,json:{error:'AUTH_REQUIRED'}})});
 await page.goto('/tools/bmp-to-png?lang=en&mini=1');
 const png=await sharp({create:{width:30,height:20,channels:3,background:'red'}}).png().toBuffer();
 const area=page.locator('[data-tool-workbench]');await area.locator('input[type=file]').setInputFiles({name:'copy_1B094041-A800-449A-A34B-E922EF0FA6BA_'+('longfilename'.repeat(10))+'.bmp',mimeType:'image/png',buffer:png});
 await area.locator('button:visible:enabled').filter({hasNotText:/^(Remove|Clear|Choose file)$/}).last().click();
 await expect(page.getByTestId('result-file-actions')).toBeVisible();return()=>uploads;
}
for(const outcome of ['shared','cancelled','unsupported','failed'])test(`file delivery ${outcome}: truthful status and explicit upload only`,async({page})=>{
 const uploads=await prepare(page,outcome),actions=page.getByTestId('result-file-actions');
 const waiting=page.waitForEvent('download');await actions.getByRole('button',{name:'Save file',exact:true}).click();const download=await waiting;expect(download.suggestedFilename().endsWith('.png')).toBe(true);expect((await sharp(await fs.readFile((await download.path())!)).metadata()).width).toBe(30);
 expect(await page.evaluate(()=>(window as any).__handoff)).toBeUndefined();expect(uploads()).toBe(0);
 await actions.getByRole('button',{name:'Send file',exact:true}).click();await expect(actions.getByRole('status')).toContainText(outcome==='shared'?'Handed to the system':outcome==='cancelled'?'Sharing cancelled':outcome==='unsupported'?'cannot share':'did not finish');
 if(outcome!=='unsupported'){const payload=await page.evaluate(()=>(window as any).__handoff);expect(payload.type).toBe('image/png');expect(payload.name.endsWith('.png')).toBe(true);expect(payload.active).toBe(true)}
 expect(uploads()).toBe(0);await expect(actions.getByRole('button',{name:'Save file',exact:true})).toBeEnabled();
 await actions.locator('details').evaluate((el:HTMLDetailsElement)=>{el.open=true});await actions.getByRole('button',{name:'Upload and open temporary file',exact:true}).click();await expect(actions.getByRole('status')).toContainText('Temporary download unavailable');expect(uploads()).toBe(1);
});
test('long exported filenames and file actions fit a 320px viewport',async({page})=>{
 await page.setViewportSize({width:320,height:800});await prepare(page,'unsupported');
 const size=await page.getByTestId('result-file-actions').evaluate(el=>({width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right,scroll:el.scrollWidth}));expect(size.right).toBeLessThanOrEqual(320);expect(size.scroll).toBeLessThanOrEqual(size.width+1);
 const name=page.getByTestId('result-file-actions').locator('..');expect(await name.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
});
test('unsupported file sharing does not reserve an export or ask for payment',async({page})=>{
 let claims=0;await page.route('**/api/tools/free-export',r=>{claims++;return r.fulfill({status:402,json:{id:r.request().postDataJSON().id,allowed:false,paidUnits:1,freeUnits:0,loginRequired:false}})});
 await prepare(page,'unsupported');const actions=page.getByTestId('result-file-actions');await actions.getByRole('button',{name:'Send file',exact:true}).click();await expect(actions.getByRole('status')).toContainText('cannot share');expect(claims).toBe(0);await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('video-toolkit extracts a real playable MP3 and hands identical bytes to file sharing',async({page})=>{
 test.setTimeout(120000);
 await page.addInitScript(()=>{const NativeWorker=Worker;(window as any).__ffmpegLogs=[];window.Worker=class extends NativeWorker{constructor(url:string|URL,options?:WorkerOptions){super(url,options);this.addEventListener('message',e=>{if(['LOG','ERROR'].includes(e.data?.type))(window as any).__ffmpegLogs.push(e.data)})}}});
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  Object.defineProperty(navigator,'share',{configurable:true,value:async(data:ShareData)=>{const f=data.files![0];(window as any).__audioShare={name:f.name,type:f.type,size:f.size,bytes:Array.from(new Uint8Array(await f.arrayBuffer()))}}});
 });
 let uploads=0;await page.route('**/api/tools/mobile-file',r=>{uploads++;return r.abort()});
 await page.goto('/tools/video-toolkit?lang=en&mini=1');await page.locator('h1').click();
 const video=Buffer.from(await page.evaluate(async()=>{const ctx=new AudioContext();await ctx.resume();const out=ctx.createMediaStreamDestination(),osc=ctx.createOscillator(),gain=ctx.createGain();gain.gain.value=.1;osc.connect(gain).connect(out);osc.start();const canvas=document.createElement('canvas');canvas.width=160;canvas.height=120;canvas.getContext('2d')!.fillRect(0,0,160,120);const stream=canvas.captureStream(12);for(const track of out.stream.getAudioTracks())stream.addTrack(track);const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus'}),chunks:BlobPart[]=[];const done=new Promise<Blob>(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>resolve(new Blob(chunks,{type:'video/webm'}))});recorder.start();await new Promise(r=>setTimeout(r,1200));recorder.stop();const blob=await done;osc.stop();for(const t of stream.getTracks())t.stop();await ctx.close();return Array.from(new Uint8Array(await blob.arrayBuffer()))}));
 await fs.writeFile(test.info().outputPath('source-with-audio.webm'),video);const area=page.locator('[data-tool-workbench]');const input=area.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'copy_1B094041-A800-449A-A34B-E922EF0FA6BA.webm',mimeType:'video/webm',buffer:video});await area.getByRole('button',{name:'Extract MP3',exact:true}).click();await area.getByRole('button',{name:'Start processing',exact:true}).click();
 const actions=page.getByTestId('result-file-actions');await Promise.race([actions.waitFor({timeout:90000}),area.getByRole('alert').waitFor({timeout:90000})]);if(!await actions.isVisible())throw Error(JSON.stringify(await page.evaluate(()=>(window as any).__ffmpegLogs)));await expect(actions).toBeVisible();const audio=actions.locator('audio');await expect.poll(()=>audio.evaluate((el:HTMLAudioElement)=>Number.isFinite(el.duration)?el.duration:0)).toBeGreaterThan(.8);
 const waiting=page.waitForEvent('download');await actions.getByRole('button',{name:'Save file',exact:true}).click();const saved=await waiting,bytes=await fs.readFile((await saved.path())!);expect(saved.suggestedFilename()).toBe('copy_1B094041-A800-449A-A34B-E922EF0FA6BA.mp3');
 await actions.getByRole('button',{name:'Send file',exact:true}).click();await expect(actions.getByRole('status')).toContainText('Handed to the system');const handed=await page.evaluate(()=>(window as any).__audioShare);expect(handed.type).toBe('audio/mpeg');expect(Buffer.from(handed.bytes)).toEqual(bytes);expect(uploads).toBe(0);
});
