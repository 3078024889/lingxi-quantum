import {test,expect,type Page} from './export-test';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import jsQR from 'jsqr';
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
 await expect(actions.getByTestId('wechat-saving-hint')).toContainText('copy the image');await expect(actions.getByTestId('wechat-saving-hint')).toContainText('system browser');
 const waiting=page.waitForEvent('download');await actions.getByRole('button',{name:'Save file',exact:true}).click();const download=await waiting;expect(download.suggestedFilename().endsWith('.png')).toBe(true);expect((await sharp(await fs.readFile((await download.path())!)).metadata()).width).toBe(30);
 expect(await page.evaluate(()=>(window as any).__handoff)).toBeUndefined();expect(uploads()).toBe(0);
 await actions.getByRole('button',{name:'Send file',exact:true}).click();await expect(actions.getByRole('status')).toContainText(outcome==='shared'?'Share menu opened':outcome==='cancelled'?'Sharing cancelled':outcome==='unsupported'?'cannot share':'did not finish');
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

test('slow export authorization waits for Continue before opening sharing and reuses the granted export',async({page})=>{
 let claims=0;await page.route('**/api/tools/free-export',async r=>{claims++;await new Promise(resolve=>setTimeout(resolve,6500));const b=r.request().postDataJSON();await r.fulfill({json:{id:b.id,allowed:true,freeUnits:b.units,paidUnits:0,loginRequired:false}})});
 const uploads=await prepare(page,'shared'),actions=page.getByTestId('result-file-actions');
 await actions.getByRole('button',{name:'Send file',exact:true}).click();
 // Locator polling executes browser evaluations that can renew activation in
 // automation. Let it expire without evaluating the page during the round trip.
 await page.waitForTimeout(7500);
 await expect(page.getByRole('dialog').getByRole('button',{name:'Continue',exact:true})).toBeVisible();expect(await page.evaluate(()=>(window as any).__handoff)).toBeUndefined();
 await page.getByRole('dialog').getByRole('button',{name:'Continue',exact:true}).click();await expect(actions.getByRole('status')).toContainText('Share menu opened');expect((await page.evaluate(()=>(window as any).__handoff)).active).toBe(true);expect(claims).toBe(1);expect(uploads()).toBe(0);
});

test('denied image copying preserves Save file and does not report a copied image',async({page})=>{
 await prepare(page,'shared');await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{write:async()=>{throw new DOMException('Denied','NotAllowedError')}}}));
 const actions=page.getByTestId('result-file-actions');await actions.getByRole('button',{name:'Copy image',exact:true}).click();await expect(actions.getByRole('status')).toContainText('Could not copy the image');await expect(actions.getByRole('button',{name:'Save file',exact:true})).toBeEnabled();
});

test('QR PNG and SVG share the exact downloaded files without spending a second export',async({page})=>{
 let claims=0;
 await page.route('**/api/tools/free-export',r=>{claims++;const b=r.request().postDataJSON();return r.fulfill({json:{id:b.id,allowed:true,paidUnits:0,freeUnits:b.units,loginRequired:false}})});
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  Object.defineProperty(navigator,'share',{configurable:true,value:async(data:ShareData)=>{const f=data.files![0];(window as any).__qrShare={name:f.name,type:f.type,bytes:Array.from(new Uint8Array(await f.arrayBuffer()))}}});
 });
 await page.goto('/tools/qr-code-generator?lang=en');const area=page.locator('[data-tool-workbench]'),payload='https://example.com/product?lang=中文';await area.locator('input').first().fill(payload);await area.getByRole('button',{name:'Generate QR',exact:true}).click();
 for(const [i,format,mime] of [[0,'PNG','image/png'],[1,'SVG','image/svg+xml']] as const){
  const actions=page.getByTestId('result-file-actions').nth(i),waiting=page.waitForEvent('download');await actions.getByRole('button',{name:format,exact:true}).click();const saved=await waiting,bytes=await fs.readFile((await saved.path())!);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});expect(jsQR(new Uint8ClampedArray(data),info.width,info.height)?.data).toBe(payload);
  await actions.getByRole('button',{name:'Send file',exact:true}).click();await expect(actions.getByRole('status')).toContainText('Share menu opened');const sent=await page.evaluate(()=>(window as any).__qrShare);expect(sent.type).toBe(mime);expect(sent.name).toBe(saved.suggestedFilename());expect(Buffer.from(sent.bytes)).toEqual(bytes);
 }
 expect(claims).toBe(2);
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
 // Synthetic canvas + oscillator recording, saved after independent decoding; avoids background-tab recorder truncation.
 const video=Buffer.from(await fs.readFile('tests/fixtures/synthetic-tone-video.webm.base64','utf8'),'base64');
 expect(video.length,'The source recording must contain media frames, not only an EBML header').toBeGreaterThan(500);await fs.writeFile(test.info().outputPath('source-with-audio.webm'),video);const area=page.locator('[data-tool-workbench]');const input=area.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'copy_1B094041-A800-449A-A34B-E922EF0FA6BA.webm',mimeType:'video/webm',buffer:video});await area.getByRole('button',{name:'Extract MP3',exact:true}).click();await area.getByRole('button',{name:'Start processing',exact:true}).click();
 const actions=page.getByTestId('result-file-actions');await Promise.race([actions.waitFor({timeout:90000}),area.getByRole('alert').waitFor({timeout:90000})]);if(!await actions.isVisible())throw Error(JSON.stringify(await page.evaluate(()=>(window as any).__ffmpegLogs)));await expect(actions).toBeVisible();const audio=actions.locator('audio');await expect.poll(()=>audio.evaluate((el:HTMLAudioElement)=>Number.isFinite(el.duration)?el.duration:0)).toBeGreaterThan(.8);
 const waiting=page.waitForEvent('download');await actions.getByRole('button',{name:'Save file',exact:true}).click();const saved=await waiting,bytes=await fs.readFile((await saved.path())!);expect(saved.suggestedFilename()).toBe('copy_1B094041-A800-449A-A34B-E922EF0FA6BA.mp3');
 await actions.getByRole('button',{name:'Send file',exact:true}).click();await expect(actions.getByRole('status')).toContainText('Share menu opened');const handed=await page.evaluate(()=>(window as any).__audioShare);expect(handed.type).toBe('audio/mpeg');expect(Buffer.from(handed.bytes)).toEqual(bytes);expect(uploads).toBe(0);
});
