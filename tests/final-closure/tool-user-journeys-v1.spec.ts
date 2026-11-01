import {test,expect} from "./export-test";
import fs from "node:fs/promises";
import sharp from "sharp";

async function textImage(page:any){
 const base64=await page.evaluate(()=>{
  const canvas=document.createElement("canvas");canvas.width=1000;canvas.height=220;
  const ctx=canvas.getContext("2d")!;ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#111";ctx.font="bold 64px Arial";ctx.fillText("HELLO WORLD 12345",30,130);
  return canvas.toDataURL("image/png").split(",")[1];
 });
 return Buffer.from(base64,"base64");
}

test("image translation completes OCR, translation, payment confirmation and a real downloadable PNG",async({page})=>{
 test.setTimeout(120000);
 await page.addInitScript(()=>{window.open=()=>({} as Window)});
 const calls:any[]=[];let quote:any=null,quoteCalls=0,payCreateCalls=0;
 const external:string[]=[];
 await page.route(/https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\//,route=>{external.push(route.request().url());return route.abort()});
 await page.route("**/api/tools/media/translate",route=>{
  const body=route.request().postDataJSON();calls.push(body);
  expect(body.source).toBe("en");expect(body.target).toBe("zh");expect(body.quoteId).toBeTruthy();
  return route.fulfill({json:{translated:"你好世界 12345"}});
 });
 await page.route("**/api/tools/quote",route=>{
  quoteCalls++;const body=route.request().postDataJSON();expect(body.toolId).toBe("image-translator");expect(body.quantity).toBe(1);
  quote={id:"11111111-1111-4111-8111-111111111111",tool_id:body.toolId,quantity:body.quantity,unit_name:"image",amount_rmb:1,amount_usd:1,currency:body.currency,display_currency:body.currency,display_amount:1,expires_at:new Date(Date.now()+3600000).toISOString(),metadata:body.metadata};
  return route.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",route=>route.fulfill({json:{paid:true,quote}}));
 await page.route("**/api/tools/pay/create",route=>{payCreateCalls++;return route.fulfill({status:500,json:{error:"REAL_PAYMENT_FORBIDDEN"}})});
 await page.goto("/tools/image-translator?lang=en");
 const input=page.locator('[data-tool-workbench] input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 const source=await textImage(page);
 await input.setInputFiles({name:"sample.png",mimeType:"image/png",buffer:source});
 await page.locator('[data-tool-workbench] select').nth(0).selectOption("en");
 await page.locator('[data-tool-workbench] select').nth(1).selectOption("zh");
 const price=page.getByRole("button",{name:"See image translation price",exact:true});
 await expect(price).toBeEnabled({timeout:15000});await price.click();
 await page.getByRole("button",{name:"Confirm & pay",exact:true}).click();
 await expect(page.getByTestId("result-file-actions")).toBeVisible({timeout:90000});
 const waiting=page.waitForEvent("download");
 await page.getByTestId("result-file-actions").getByRole("button",{name:"Save file",exact:true}).click();
 const download=await waiting,bytes=await fs.readFile((await download.path())!);
 expect(download.suggestedFilename()).toBe("sample-zh.png");
 const metadata=await sharp(bytes).metadata();expect([metadata.format,metadata.width,metadata.height]).toEqual(["png",1000,220]);
 const [before,after]=await Promise.all([sharp(source).removeAlpha().raw().toBuffer(),sharp(bytes).removeAlpha().raw().toBuffer()]);
 let changed=0;for(let i=0;i<Math.min(before.length,after.length);i++)if(before[i]!==after[i])changed++;
 expect(changed).toBeGreaterThan(100);
 expect(calls.length).toBeGreaterThan(0);expect(calls.every(x=>String(x.text).toUpperCase().includes("HELLO WORLD"))).toBeTruthy();
 expect(quoteCalls).toBe(1);expect(payCreateCalls).toBe(0);expect(external).toEqual([]);
});

test("image translation prevents a same-language no-op from creating a charge",async({page})=>{
 let quotes=0;await page.route("**/api/tools/quote",route=>{quotes++;return route.abort()});
 await page.goto("/tools/image-translator?lang=en");
 const input=page.locator('[data-tool-workbench] input[type="file"]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:"same-language.png",mimeType:"image/png",buffer:await sharp({create:{width:20,height:20,channels:3,background:"#fff"}}).png().toBuffer()});
 await page.locator('[data-tool-workbench] select').nth(0).selectOption("en");
 await page.locator('[data-tool-workbench] select').nth(1).selectOption("en");
 await expect(page.getByRole("status")).toContainText("source and target languages are the same");
 await expect(page.getByRole("button",{name:/translation price/i})).toHaveCount(0);
 expect(quotes).toBe(0);
});

test("temporary mailbox creates an inbox, retrieves and copies a code, then destroys it without payment",async({page})=>{
 let destroyed=0,quotes=0,inboxReads=0;
 const expiresAt=new Date(Date.now()+10*60_000).toISOString();
 await page.addInitScript(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async(value:string)=>{(window as any).__copiedText=value}}}));
 await page.route("**/api/tools/temp-mail/recover",route=>route.fulfill({json:{box:null}}));
 await page.route("**/api/tools/temp-mail/mine",route=>route.fulfill({json:{mailboxes:[]}}));
 await page.route("**/api/tools/temp-mail/create",route=>route.fulfill({json:{id:"mailbox-test-01",address:"demo@inbox.test",expiresAt,freeRemaining:4}}));
 await page.route("**/api/tools/temp-mail/inbox?id=mailbox-test-01",route=>{inboxReads++;return route.fulfill({json:{expiresAt,messages:[{id:"message-01",sender:"noreply@example.test",subject:"Your sign-in code",text_body:"Use 654321 to finish signing in.",received_at:new Date().toISOString(),size_bytes:120}]}})});
 await page.route("**/api/tools/temp-mail/destroy",route=>{destroyed++;return route.fulfill({json:{ok:true}})});
 await page.route("**/api/tools/quote",route=>{quotes++;return route.abort()});
 await page.goto("/tools/temp-mail?lang=en");
 await page.getByRole("button",{name:"Create temporary email",exact:true}).click();
 await expect(page.getByText("demo@inbox.test",{exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Refresh",exact:true}).click();
 await expect(page.getByText("Your sign-in code",{exact:true})).toBeVisible();
 await page.getByText("Your sign-in code",{exact:true}).click();
 await expect(page.getByText("654321",{exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Copy code",exact:true}).click();
 await expect(page.getByRole("button",{name:"Copied",exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).__copiedText)).toBe("654321");
 await page.getByRole("button",{name:"Destroy",exact:true}).click();
 await expect(page.getByRole("button",{name:"Create temporary email",exact:true})).toBeVisible();
 expect(inboxReads).toBeGreaterThan(0);expect(destroyed).toBe(1);expect(quotes).toBe(0);
});

async function syntheticWatermarkVideo(page:any){
 const values=await page.evaluate(async()=>{
  const canvas=document.createElement("canvas");canvas.width=160;canvas.height=120;
  const ctx=canvas.getContext("2d")!;ctx.fillStyle="#304060";ctx.fillRect(0,0,160,120);ctx.fillStyle="#ff2020";ctx.fillRect(120,98,26,12);
  const stream=canvas.captureStream(12);const recorder=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp8"});const chunks:BlobPart[]=[];
  const done=new Promise<Blob>(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>resolve(new Blob(chunks,{type:"video/webm"}))});
  recorder.start();await new Promise(r=>setTimeout(r,1800));recorder.stop();const blob=await done;stream.getTracks().forEach(t=>t.stop());
  return Array.from(new Uint8Array(await blob.arrayBuffer()));
 });
 return Buffer.from(values);
}

async function sampleVideoPixel(page:any,bytes:Buffer,mime:string,x:number,y:number){
 return page.evaluate(async({base64,type,x,y})=>{
  const raw=Uint8Array.from(atob(base64),ch=>ch.charCodeAt(0)),url=URL.createObjectURL(new Blob([raw],{type}));
  try{
   const video=document.createElement("video");video.preload="auto";video.src=url;
   await new Promise<void>((resolve,reject)=>{video.onloadedmetadata=()=>resolve();video.onerror=()=>reject(Error("VIDEO_UNPLAYABLE"));setTimeout(()=>reject(Error("VIDEO_META_TIMEOUT")),15000)});
   video.currentTime=Math.min(.6,video.duration/2);
   await new Promise<void>((resolve,reject)=>{video.onseeked=()=>resolve();video.onerror=()=>reject(Error("VIDEO_SEEK_FAILED"))});
   const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d")!;ctx.drawImage(video,0,0);
   return Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
  }finally{URL.revokeObjectURL(url)}
 },{base64:bytes.toString("base64"),type:mime,x,y}) as Promise<number[]>;
}

test("video watermark removal runs FFmpeg locally and exports a playable MP4 with the marked region changed",async({page})=>{
 test.setTimeout(180000);
 await page.addInitScript(()=>{window.open=()=>({} as Window)});
 let quote:any=null,quoteCalls=0,payCreateCalls=0;
 await page.route("**/api/tools/quote",route=>{
  quoteCalls++;const body=route.request().postDataJSON();expect(body.toolId).toBe("video-watermark-remover");expect(body.quantity).toBe(1);
  quote={id:"22222222-2222-4222-8222-222222222222",tool_id:body.toolId,quantity:body.quantity,unit_name:"minute",amount_rmb:1.2,amount_usd:1.2,currency:body.currency,display_currency:body.currency,display_amount:1.2,expires_at:new Date(Date.now()+3600000).toISOString(),metadata:body.metadata};
  return route.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",route=>route.fulfill({json:{paid:true,quote}}));
 await page.route("**/api/tools/pay/create",route=>{payCreateCalls++;return route.fulfill({status:500,json:{error:"REAL_PAYMENT_FORBIDDEN"}})});
 await page.goto("/tools/video-watermark-remover?lang=en");
 const source=await syntheticWatermarkVideo(page);
 const input=page.locator('[data-tool-workbench] input[type="file"]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:"fixed-watermark.webm",mimeType:"video/webm",buffer:source});
 await expect(page.getByRole("button",{name:"See watermark-removal price",exact:true})).toBeEnabled({timeout:20000});
 await page.getByRole("button",{name:"See watermark-removal price",exact:true}).click();
 await page.getByRole("button",{name:"Confirm & pay",exact:true}).click();
 const actions=page.getByTestId("result-file-actions").last();await expect(actions).toBeVisible({timeout:150000});
 const pending=page.waitForEvent("download");await actions.getByRole("button",{name:"Download",exact:true}).click();
 const download=await pending,bytes=await fs.readFile((await download.path())!);
 expect(download.suggestedFilename()).toBe("clean-fixed-watermark.mp4");
 expect(bytes.includes(Buffer.from("ftyp"))).toBeTruthy();expect(bytes.byteLength).toBeGreaterThan(1000);
 const metadata=await page.evaluate(async base64=>{
  const raw=Uint8Array.from(atob(base64),ch=>ch.charCodeAt(0)),url=URL.createObjectURL(new Blob([raw],{type:"video/mp4"}));
  try{const video=document.createElement("video");video.preload="metadata";video.src=url;await new Promise<void>((resolve,reject)=>{video.onloadedmetadata=()=>resolve();video.onerror=()=>reject(Error("VIDEO_UNPLAYABLE"));setTimeout(()=>reject(Error("VIDEO_META_TIMEOUT")),15000)});return{width:video.videoWidth,height:video.videoHeight,duration:video.duration}}
  finally{URL.revokeObjectURL(url)}
 },bytes.toString("base64"));
 expect(metadata.width).toBe(160);expect(metadata.height).toBe(120);expect(metadata.duration).toBeGreaterThan(1);expect(metadata.duration).toBeLessThan(4);
 const originalPixel=await sampleVideoPixel(page,source,"video/webm",132,104);
 const cleanedPixel=await sampleVideoPixel(page,bytes,"video/mp4",132,104);
 expect(originalPixel[0]).toBeGreaterThan(originalPixel[2]+80);
 expect(cleanedPixel[0]).toBeLessThan(originalPixel[0]-35);
 expect(quoteCalls).toBe(1);expect(payCreateCalls).toBe(0);
});
