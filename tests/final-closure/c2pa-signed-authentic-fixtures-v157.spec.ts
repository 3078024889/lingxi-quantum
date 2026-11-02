import {test,expect} from "./export-test";
import {readFile} from "node:fs/promises";
import type {Page} from "playwright";

// Real c2pa-rs signed test-PKI assets, pinned by SHA and authenticated by
// scripts/ci/fetch-signed-c2pa-fixtures-v157.mjs.
// A test-PKI signer is not a trusted identity. Positive signature validation
// must never be presented as proof the photo/video depicts a true event.
const directory="test-results/c2pa-signed-fixtures-v157";
async function inspect(page:Page,slug:string,name:string,mimeType:string,buffer:Buffer){
 await page.goto("/tools/"+slug+"?lang=en");
 await page.locator('main input[type="file"]').first().setInputFiles({name,mimeType,buffer});
 await page.getByRole("button",{name:"Start checking",exact:true}).click();
 const result=page.locator("main > section > ul > li").filter({hasText:name}).first();
 await expect(result).toBeVisible({timeout:15000});
 const status=result.locator("[data-c2pa-verification]");
 await expect(status).toBeVisible({timeout:15000});
 return status;
}
for(const item of [
 {slug:"ai-image-check",name:"sample.jpg",mime:"image/jpeg"},
 {slug:"ai-video-audio-check",name:"sample.mp4",mime:"video/mp4"}
] as const){
 test(item.slug+": signed upstream media must expose a cryptographically verified test-credential manifest",async({page})=>{
  test.setTimeout(150000);
  const data=await readFile(directory+"/"+item.name);
  const status=await inspect(page,item.slug,item.name,item.mime,data);
  await expect.poll(()=>status.getAttribute("data-c2pa-verification"),{timeout:110000}).toMatch(/^(untrusted|valid|trusted)$/);
  // A valid signature does not establish human origin or that a scene really happened.
  await expect(page.locator("main")).toContainText("does not prove a scene is real");
 });
}
test("ai-image-check: changing image bytes after signing invalidates real JPEG hard binding",async({page})=>{
 test.setTimeout(150000);
 const source=Buffer.from(await readFile(directory+"/sample.jpg"));
 const start=source.indexOf(Buffer.from([0xff,0xda]));
 if(start<0)throw Error("SIGNED_JPEG_SCAN_NOT_FOUND");
 const length=source.readUInt16BE(start+2),begin=start+2+length;
 let at=-1;
 for(let i=begin+12;i<Math.min(source.length-2,begin+200);i++){
  if(source[i]!==0xff&&source[i]!==0x00){at=i;break}
 }
 if(at<0)throw Error("SIGNED_JPEG_ENTROPY_NOT_FOUND");
 source[at]^=0x01;
 const status=await inspect(page,"ai-image-check","tampered-sample.jpg","image/jpeg",source);
 await expect.poll(()=>status.getAttribute("data-c2pa-verification"),{timeout:110000}).toBe("invalid");
});
