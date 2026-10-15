import {test,expect} from './export-test';
import {approvedScriptPreview,approvedEpisodeShots} from '../../lib/sasi/approved-script-preview';
import JSZip from 'jszip';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import {seriesProgressState} from '../../lib/sasi/series-progress-state';
const script='第一集：星光\n海边相遇，两人互相介绍自己的名字。\n一起寻找海边遗失的旧照片。\n谈论照片里曾经生活的城市。\n暴雨来临，他们一起寻找避雨地点。\n约好明天再来这座小屋。';
const projectId='55555555-5555-4555-8555-555555555555',productionId='66666666-6666-4666-8666-666666666666';
test('one unavailable episode never freezes progress while the other episodes are still running',()=>{
 const blocked={state:'succeeded',output_json:{state:'needs-connection'}};expect(seriesProgressState(0,2,[blocked,{state:'created'}])).toBe('planning');expect(seriesProgressState(0,2,[blocked,{state:'running'}])).toBe('planning');expect(seriesProgressState(0,2,[blocked,blocked])).toBe('needs-connection');expect(seriesProgressState(1,2,[{state:'succeeded'},{state:'failed'}])).toBe('failed');expect(seriesProgressState(2,2,[{state:'created'}])).toBe('ready');expect(seriesProgressState(0,2,[{state:'succeeded'},{state:'succeeded'}])).toBe('failed');
});
test('approved material never invents missing episodes or stretches an outline',()=>{
 const preview=approvedScriptPreview(script,20)!;expect(preview.scriptedEpisodes).toEqual([1]);expect(approvedEpisodeShots(script,1,20,60)?.reduce((sum,shot)=>sum+shot.duration,0)).toBe(60);expect(approvedEpisodeShots(script,2,20,60)).toBeNull();expect(approvedEpisodeShots('第一集：简介\n只是一行故事简介，没有完整分镜。',1,20,60)).toBeNull();expect(approvedScriptPreview('完整故事的大纲，但没有逐集脚本。',20)?.scriptedEpisodes).toEqual([]);expect(approvedScriptPreview(script,51)).toBeNull();
});
for(const state of ['needs-connection','failed','ready'])test(`saved ${state} planning shows terminal status and keeps a usable preview`,async({page})=>{
 let reads=0,paid=0;await page.route(/\/api\/sasi\/conversations(?:\/workspace)?(?:\?|$)/,route=>route.fulfill({json:route.request().method()==='POST'?{ok:true}:{ownerId:'11111111-1111-4111-8111-111111111111',threadId:'22222222-2222-4222-8222-222222222222',threads:[],messages:[],workspace:{mode:'drama',projectId,approvedScript:script,creation:{drama:{projectId,prompt:'生成20集短剧，每集1分钟，16:9',productionId,seriesState:'planning'}}}}}));
 await page.route('**/api/sasi/byok/video**',route=>{if(route.request().method()==='POST')paid++;return route.fulfill({json:{connected:false,profiles:[],tasks:[]}});});
 await page.route('**/api/sasi/drama/series?**',route=>{reads++;return route.fulfill({json:{state,readyEpisodes:state==='ready'?20:0,shots:[],preview:approvedScriptPreview(script,20)}});});
 await page.goto('/sasi?mode=drama&lang=en');await expect(page.locator('[data-sasi-script-preview]')).toBeVisible();await expect(page.getByText(state==='ready'?'Storyboards are ready. View the preview and continue creating.':state==='failed'?'Storyboard planning failed. Your conversation and script are kept. Retry or check your AI connection.':'Free model planning could not finish. View the free preview of your existing script; further model generation needs a working AI connection.')).toBeVisible();expect(paid).toBe(0);
 if(state==='needs-connection'){
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download script and preview images'}).click();const file=await downloaded;const zip=await JSZip.loadAsync(await fs.readFile((await file.path())!));expect(await zip.file('approved-script.txt')!.async('string')).toBe(script);const image=await zip.file('preview-01.png')!.async('nodebuffer');expect(await sharp(image).metadata()).toMatchObject({width:1280,height:720});
 const videoDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Create free animatic preview'}).click();const video=await videoDownload;const path=(await video.path())!;expect((await fs.stat(path)).size).toBeGreaterThan(1000);const url=await page.evaluate(async bytes=>{const data=Uint8Array.from(bytes);const video=document.createElement('video');video.src=URL.createObjectURL(new Blob([data],{type:'video/webm'}));document.body.appendChild(video);await new Promise<void>((resolve,reject)=>{video.onloadeddata=()=>resolve();video.onerror=()=>reject(Error('VIDEO_DECODE_FAILED'));});return {width:video.videoWidth,height:video.videoHeight};},Array.from(await fs.readFile(path)));expect(url).toEqual({width:1280,height:720});
 await page.reload();await expect(page.locator('[data-sasi-script-preview]')).toBeVisible();await expect(page.getByText('Free model planning could not finish. View the free preview of your existing script; further model generation needs a working AI connection.')).toBeVisible();const completedReads=reads;await page.clock.install();await page.clock.fastForward(30000);expect(reads).toBe(completedReads);expect(paid).toBe(0);
 }
});
test('unavailable progress replaces waiting and offers a read-only retry',async({page})=>{
 let reads=0;await page.route(/\/api\/sasi\/conversations(?:\/workspace)?(?:\?|$)/,route=>route.fulfill({json:route.request().method()==='POST'?{ok:true}:{ownerId:'11111111-1111-4111-8111-111111111111',threadId:'22222222-2222-4222-8222-222222222222',threads:[],messages:[],workspace:{mode:'drama',projectId,approvedScript:script,creation:{drama:{projectId,prompt:'生成20集短剧，每集1分钟',productionId}}}}}));
 await page.route('**/api/sasi/byok/video**',route=>route.fulfill({json:{connected:false,profiles:[],tasks:[]}}));
 await page.route('**/api/sasi/drama/series?**',route=>{reads++;return route.fulfill({status:401,json:{error:'AUTH_REQUIRED'}});});
 await page.goto('/sasi?mode=drama&lang=en');await expect(page.getByText('Storyboard progress is temporarily unavailable. Saved content is kept. Retry or continue later.')).toBeVisible();const previousReads=reads;await page.getByRole('button',{name:'Refresh progress'}).click();await expect.poll(()=>reads).toBe(previousReads+1);await expect(page.locator('[data-sasi-script-preview]')).toBeVisible();
});
