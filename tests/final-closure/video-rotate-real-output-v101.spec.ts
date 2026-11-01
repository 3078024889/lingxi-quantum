import {test,expect} from "./export-test";
import fs from "node:fs/promises";

test("video rotation is discoverable as its own tool",async({page})=>{
 await page.goto("/tools?q=%E8%A7%86%E9%A2%91%E6%97%8B%E8%BD%AC&lang=zh");
 await expect(page.locator('a[href="/tools/rotate-video"]').first()).toBeVisible();
 await page.goto("/tools/rotate-video?lang=en");
 await expect(page.locator('input[type="file"]').first()).toBeEnabled();
 await expect(page.getByRole("button",{name:"Compress",exact:true})).toHaveCount(0);
 await expect(page.getByRole("combobox").filter({has:page.locator('option[value="90"]')}).first()).toBeVisible();
});

test("real Opus WebM rotate 90 degrees preserves runtime and shares exact saved MP4 bytes",async({page})=>{
 test.setTimeout(150000);
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,"canShare",{configurable:true,value:()=>true});
  Object.defineProperty(navigator,"share",{configurable:true,value:async(data:ShareData)=>{
   const file=data.files?.[0];if(!file)throw Error("NO_SHARE_FILE");
   (window as any).__rotationShare={name:file.name,type:file.type,active:navigator.userActivation?.isActive??null,bytes:Array.from(new Uint8Array(await file.arrayBuffer()))};
  }});
 });
 let privateUploads=0;
 await page.route("**/api/tools/free-export",route=>route.fulfill({status:200,json:{id:route.request().postDataJSON().id,allowed:true,paidUnits:0,loginRequired:false}}));
 await page.route("**/api/tools/mobile-file",route=>{privateUploads++;return route.abort()});
 await page.goto("/tools/rotate-video?lang=en&mini=1");
 await page.locator("h1").click();
 const source=Buffer.from(await page.evaluate(async()=>{
  const audio=new AudioContext();await audio.resume();
  const output=audio.createMediaStreamDestination(),osc=audio.createOscillator(),gain=audio.createGain();
  gain.gain.value=.05;osc.connect(gain).connect(output);osc.start();
  const canvas=document.createElement("canvas");canvas.width=160;canvas.height=120;
  const ctx=canvas.getContext("2d")!;ctx.fillStyle="#f33";ctx.fillRect(0,0,55,120);
  ctx.fillStyle="#38f";ctx.fillRect(55,0,105,120);
  const stream=canvas.captureStream(12);output.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
  const recorder=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp8,opus"});
  const chunks:BlobPart[]=[];const done=new Promise<Blob>(resolve=>{
   recorder.ondataavailable=e=>chunks.push(e.data);
   recorder.onstop=()=>resolve(new Blob(chunks,{type:"video/webm"}));
  });
  recorder.start();await new Promise(r=>setTimeout(r,1600));recorder.stop();
  const blob=await done;osc.stop();stream.getTracks().forEach(t=>t.stop());await audio.close();
  return Array.from(new Uint8Array(await blob.arrayBuffer()));
 }));
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"orientation-test.webm",mimeType:"video/webm",buffer:source});
 await area.getByRole("button",{name:"Start processing"}).click();
 const actions=page.getByTestId("result-file-actions");
 await expect(actions).toBeVisible({timeout:120000});
 // First click authorizes asynchronously; it MUST NOT invoke native share after the await.
 await actions.getByRole("button",{name:"Send file",exact:true}).click();
 await expect(actions.getByRole("status")).toContainText("Export access confirmed");
 expect(await page.evaluate(()=>(window as any).__rotationShare)).toBeUndefined();
 // A separate real click preserves transient user activation for native share.
 await actions.getByRole("button",{name:"Tap to send file",exact:true}).click();
 await expect(actions.getByRole("status")).toContainText("Handed to the system");
 const sent=await page.evaluate(()=>(window as any).__rotationShare);
 expect(sent.active).not.toBe(false);
 const downloadEvent=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const downloaded=await downloadEvent,bytes=await fs.readFile((await downloaded.path())!);
 expect(downloaded.suggestedFilename()).toBe("orientation-test-rotate-90.mp4");
 // MP4 with an Opus track is not reliably playable on many mobile devices.
 // "mp4a" is the MP4 sample entry for AAC; "Opus" indicates the old broken copy path.
 expect(bytes.includes(Buffer.from("mp4a"))).toBe(true);
 expect(bytes.includes(Buffer.from("Opus"))).toBe(false);
 expect(bytes.byteLength).toBeGreaterThan(1000);
 const metadata=await page.evaluate(async(base64)=>{
  const bytes=Uint8Array.from(atob(base64),ch=>ch.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([bytes],{type:"video/mp4"}));
  try{
   const video=document.createElement("video");video.preload="metadata";video.src=url;
   await new Promise<void>((resolve,reject)=>{
    video.onloadedmetadata=()=>resolve();video.onerror=()=>reject(Error("VIDEO_UNPLAYABLE"));
    setTimeout(()=>reject(Error("VIDEO_META_TIMEOUT")),15000);
   });
   return {width:video.videoWidth,height:video.videoHeight,duration:video.duration};
  }finally{URL.revokeObjectURL(url)}
 },bytes.toString("base64"));
 expect(metadata.width).toBe(120);
 expect(metadata.height).toBe(160);
 expect(metadata.duration).toBeGreaterThan(1.2);
 expect(metadata.duration).toBeLessThan(3);
 expect(sent.name).toBe(downloaded.suggestedFilename());
 expect(sent.type).toBe("video/mp4");
 expect(Buffer.from(sent.bytes)).toEqual(bytes);
 expect(privateUploads).toBe(0);
});
