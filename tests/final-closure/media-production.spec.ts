import{test,expect}from"playwright/test";

test("ffmpeg runtime files are real wasm/js assets",async({page})=>{
 await page.goto("/tools/video-toolkit",{waitUntil:"domcontentloaded"});
 const result=await page.evaluate(async()=>{
  const [j,w]=await Promise.all([fetch("/media/ffmpeg-0.12.10/ffmpeg-core.js"),fetch("/media/ffmpeg-0.12.10/ffmpeg-core.wasm")]);
  const bytes=await w.arrayBuffer();
  return{js:j.ok,wasm:w.ok,size:bytes.byteLength,valid:WebAssembly.validate(bytes)};
 });
 expect(result.js).toBeTruthy();expect(result.wasm).toBeTruthy();expect(result.size).toBeGreaterThan(100000);expect(result.valid).toBeTruthy();
});

test("media production routes render real workbenches",async({page})=>{
 for(const slug of ["video-dubbing","video-transcription","video-toolkit","video-watermark-remover","image-translator","image-watermark-remover","batch-image-watermark-remover","ocr"]){
  const r=await page.goto(`/tools/${slug}`,{waitUntil:"domcontentloaded"});expect(r?.status(),slug).toBeLessThan(400);await expect(page.locator("body")).toBeVisible();
 }
});
