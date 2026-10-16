import {test,expect} from './export-test';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

function run(bin:string,args:string[]){const r=spawnSync(bin,args,{encoding:'utf8',timeout:180000});if(r.error)throw r.error;expect(r.status,r.stderr).toBe(0);return r.stdout;}
function probe(path:string){return JSON.parse(run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',path]));}
const modes=['Compress','Trim','Extract MP3','Mute','Convert MP4','Rotate90','Rotate180','Rotate270','Speed'] as const;
test.skip(process.env.MEDIA_ACCEPTANCE!=='1','Run on the dedicated remote FFmpeg acceptance runner.');
for(const seconds of [2,12,60,125])for(const mode of modes)test(`real saved media ${seconds}s ${mode}: reopen and fully decode`,async({page},info)=>{
 test.setTimeout(240000);
 const input=info.outputPath('input.mp4');
 await fs.mkdir(info.outputDir,{recursive:true});
 run('ffmpeg',['-v','error','-f','lavfi','-i',`testsrc2=size=160x90:rate=25:duration=${seconds}`,'-f','lavfi','-i',`sine=frequency=440:sample_rate=48000:duration=${seconds}`,'-c:v','libx264','-c:a','aac','-shortest','-y',input]);
 await page.goto('/tools/video-toolkit?lang=en');
 const area=page.locator('[data-tool-workbench]');
 const button=mode.startsWith('Rotate')?'Rotate':mode;
 await area.getByRole('button',{name:button,exact:true}).click();
 await area.locator('input[type=file]').first().setInputFiles(input);
 if(mode.startsWith('Rotate'))await area.getByRole('combobox').first().selectOption(mode.slice(6));
 if(mode==='Speed')await area.getByRole('slider').press('End');
 // Default trim is intentional. Set an explicit range valid even for a 2s clip.
 if(mode==='Trim'){await area.getByRole('spinbutton').nth(0).fill('0');await area.getByRole('spinbutton').nth(1).fill(String(seconds/2));}
 await area.getByRole('button',{name:'Start processing',exact:true}).click();
 const actions=page.getByTestId('result-file-actions');
 await expect(actions).toBeVisible({timeout:180000});
 const preview=actions.locator(mode==='Extract MP3'?'audio':'video');
 await expect(preview).toHaveCount(1);
 await expect.poll(()=>preview.evaluate((el:HTMLMediaElement)=>el.readyState),{timeout:15000}).toBeGreaterThanOrEqual(1);
 const pending=page.waitForEvent('download');await actions.getByRole('button',{name:'Save file',exact:true}).click();
 const download=await pending,output=info.outputPath(mode==='Extract MP3'?'downloaded.mp3':'downloaded.mp4');
 await download.saveAs(output);
 const before=probe(input),after=probe(output),actual=Number(after.format.duration),expected=mode==='Trim'||mode==='Speed'?seconds/2:seconds;
 expect(Math.abs(actual-expected)).toBeLessThanOrEqual(Math.max(.4,expected*.04));
 const videos=after.streams.filter((s:any)=>s.codec_type==='video'),audios=after.streams.filter((s:any)=>s.codec_type==='audio');
 expect(videos.length).toBe(mode==='Extract MP3'?0:1);expect(audios.length).toBe(mode==='Mute'?0:1);
 if(mode==='Rotate90'||mode==='Rotate270'){expect(videos[0].width).toBe(90);expect(videos[0].height).toBe(160);}
 if(videos.length&&audios.length)expect(Math.abs(Number(videos[0].duration)-Number(audios[0].duration))).toBeLessThan(.3);
 // Re-read the saved file, then decode every packet. Browser success alone is insufficient.
 expect((await fs.readFile(output)).length).toBeGreaterThan(1024);
 const decode=run('ffmpeg',['-v','error','-xerror','-i',output,'-progress','pipe:1','-f','null','-']);
 const timestamps=[...decode.matchAll(/^out_time_us=(\d+)/gm)].map(m=>Number(m[1])/1e6);
 const decodedEnd=Math.max(...timestamps);
 expect(Math.abs(decodedEnd-expected)).toBeLessThanOrEqual(Math.max(.4,expected*.04));
 const report={mode,seconds,expected,decodedEnd,before,after,fullDecode:true,deviceProject:info.project.name,realWeChatDelivery:'not tested'};
 const reportPath=info.outputPath('verification.json');await fs.writeFile(reportPath,JSON.stringify(report,null,2));
 await info.attach('media-verification',{path:reportPath,contentType:'application/json'});
 if(videos.length){for(const [name,time] of [['first',0],['last',Math.max(0,actual-.15)]] as const){const path=info.outputPath(`${name}.png`);run('ffmpeg',['-v','error','-ss',String(time),'-i',output,'-frames:v','1','-y',path]);await info.attach(name,{path,contentType:'image/png'});}}
});

for(const seconds of [2,12,60,125])for(const effect of ['reverse-video','loop-video','stop-motion-video','boomerang','video-watermark-remover'])test(`real saved effect ${seconds}s ${effect}: full export with isolated payment`,async({page},info)=>{
 test.setTimeout(240000);await fs.mkdir(info.outputDir,{recursive:true});
 const input=info.outputPath('input.mp4');
 run('ffmpeg',['-v','error','-f','lavfi','-i',`testsrc2=size=160x90:rate=25:duration=${seconds}`,'-f','lavfi','-i',`sine=frequency=440:sample_rate=48000:duration=${seconds}`,'-c:v','libx264','-c:a','aac','-shortest','-y',input]);
 let quote:any,quoteCalls=0;
 // Browser interception only. Never submit a real payment or invoke a model provider.
 await page.route('**/api/tools/quote',r=>{quoteCalls++;const b=r.request().postDataJSON();quote={id:'isolated-duration',tool_id:'video-watermark-remover',quantity:b.quantity,metadata:b.metadata,unit_name:'minute',amount_rmb:1,amount_usd:1,display_amount:1,display_currency:b.currency,currency:b.currency,expires_at:new Date(Date.now()+3600000).toISOString()};return r.fulfill({json:quote});});
 await page.route('**/api/tools/pay/**',r=>r.request().method()==='GET'?r.fulfill({json:{paid:true,quote}}):r.abort());
 await page.goto(`/tools/${effect==='boomerang'?'stop-motion-video':effect}?lang=en`);
 const area=page.locator('[data-tool-workbench]');
 await area.locator('input[type=file]').first().setInputFiles(input);
 if(effect==='boomerang')await area.getByRole('checkbox').check();
 if(effect==='video-watermark-remover'){
  await area.getByRole('button',{name:'See watermark-removal price',exact:true}).click();
  await expect(page.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 }else await area.getByRole('button',{name:'Start',exact:true}).click();
 const actions=page.getByTestId('result-file-actions');await expect(actions).toBeVisible({timeout:180000});
 await expect(actions.locator('video')).toHaveCount(1);
 const pending=page.waitForEvent('download');await actions.getByRole('button',{name:effect==='video-watermark-remover'?'Download':'Save file',exact:true}).click();
 const output=info.outputPath('downloaded.mp4');await(await pending).saveAs(output);
 const before=probe(input),after=probe(output),expected=seconds*(effect==='loop-video'||effect==='boomerang'?2:1),actual=Number(after.format.duration);
 const tolerance=Math.max(effect==='boomerang'?.85:.45,expected*.04);
 expect(Math.abs(actual-expected)).toBeLessThanOrEqual(tolerance);
 const audio=after.streams.filter((s:any)=>s.codec_type==='audio'),video=after.streams.filter((s:any)=>s.codec_type==='video');
 expect(video).toHaveLength(1);expect(audio).toHaveLength(effect==='stop-motion-video'||effect==='boomerang'?0:1);
 if(audio.length)expect(Math.abs(Number(audio[0].duration)-Number(video[0].duration))).toBeLessThan(.3);
 const decoded=run('ffmpeg',['-v','error','-xerror','-i',output,'-progress','pipe:1','-f','null','-']);
 const decodedEnd=Math.max(...[...decoded.matchAll(/^out_time_us=(\d+)/gm)].map(m=>Number(m[1])/1e6));
 expect(Math.abs(decodedEnd-expected)).toBeLessThanOrEqual(tolerance);
 const path=info.outputPath('verification.json');await fs.writeFile(path,JSON.stringify({effect,seconds,expected,actual,decodedEnd,before,after,fullDecode:true,payment:'isolated',quoteCalls,deviceProject:info.project.name},null,2));await info.attach('media-verification',{path,contentType:'application/json'});
 for(const [name,time] of [['first',0],['last',Math.max(0,actual-.2)]] as const){const path=info.outputPath(`${name}.png`);run('ffmpeg',['-v','error','-ss',String(time),'-i',output,'-frames:v','1','-y',path]);await info.attach(name,{path,contentType:'image/png'});}
 expect(quoteCalls).toBe(effect==='video-watermark-remover'?1:0);
});
