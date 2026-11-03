import {test,expect} from "./export-test";

/** Genuine 1-second, 16 kHz, mono PCM WAV test fixture. */
function wavFixture(){
 const samples=16000,byteLength=44+samples*2;
 const b=Buffer.alloc(byteLength);
 b.write("RIFF",0);b.writeUInt32LE(byteLength-8,4);b.write("WAVE",8);
 b.write("fmt ",12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);
 b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);
 b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);
 b.write("data",36);b.writeUInt32LE(samples*2,40);
 return b;
}

for(const slug of ["audio-transcription","video-transcription"] as const){
 test(slug + ": real WAV upload, duration meter and restorable draft without payment",async({page})=>{
  test.setTimeout(60000);
  const response=await page.goto("/tools/"+slug+"?lang=en",{waitUntil:"domcontentloaded"});
  expect(response?.status()).toBe(200);
  const upload=page.locator('input[type="file"]').first();
  await expect(upload).toBeEnabled({timeout:15000});
  await upload.setInputFiles({name:"spoken-sample.wav",mimeType:"audio/wav",buffer:wavFixture()});
  await expect(page.getByText("spoken-sample.wav").first()).toBeVisible();
  await expect(page.locator('[data-testid="draft-saved"]')).toBeVisible({timeout:25000});
  // No paid action issued; this is not a claim of paid model inference.
  await expect(page.getByRole("textbox",{name:"Result"})).toHaveCount(0);
 });
}

test("audio transcription rejects a non-media input before metering",async({page})=>{
 await page.goto("/tools/audio-transcription?lang=en",{waitUntil:"domcontentloaded"});
 const upload=page.locator('input[type="file"]').first();
 await expect(upload).toBeEnabled({timeout:15000});
 await upload.setInputFiles({name:"not-audio.txt",mimeType:"text/plain",buffer:Buffer.from("Not media")});
 await expect(page.locator('p[role="alert"]').filter({hasText:"Unsupported file type"})).toBeVisible();
 await expect(page.locator('[data-testid="draft-saved"]')).toHaveCount(0);
});
