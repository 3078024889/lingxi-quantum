import {test,expect} from "./export-test";
import sharp from "sharp";
import {hasHeicContainer,verifiedJpeg} from "../../lib/tools/shared/heif-validation";

function box(major:string,compatible:string[]=[]){
 const b=Buffer.alloc(20+Math.max(0,compatible.length-1)*4);
 b.writeUInt32BE(b.length,0);b.write("ftyp",4,"ascii");b.write(major,8,"ascii");
 b.writeUInt32BE(0,12);
 b.write(compatible[0]||major,16,"ascii");
 compatible.slice(1).forEach((brand,i)=>b.write(brand,20+i*4,"ascii"));
 return new Blob([b]);
}
test("HEIC source fingerprint: use actual compatible brands, not extension or browser MIME",async()=>{
 expect(await hasHeicContainer(box("heic"))).toBe(true);
 expect(await hasHeicContainer(box("mif1",["heic"]))).toBe(true);
 expect(await hasHeicContainer(box("heix"))).toBe(true);
 expect(await hasHeicContainer(box("avif"))).toBe(false);
 expect(await hasHeicContainer(box("mif1",["avif"]))).toBe(false);
 expect(await hasHeicContainer(new Blob([Buffer.from("not a HEIF file")]))).toBe(false);
});
test("HEIC target format: corrupt or mislabeled outputs never get a .jpg successful download",async()=>{
 await expect(verifiedJpeg(new Blob([]))).rejects.toThrow("JPEG_OUTPUT_EMPTY");
 await expect(verifiedJpeg(new Blob([Buffer.from("fake jpeg image")]))).rejects.toThrow("JPEG_OUTPUT_INVALID");
 const truncated=new Blob([new Uint8Array([0xff,0xd8,0xff,0xe0]),Buffer.alloc(128)]);
 await expect(verifiedJpeg(truncated)).rejects.toThrow("JPEG_OUTPUT_INVALID");
 const decoded=new Blob([await sharp({create:{width:8,height:8,channels:3,background:"red"}}).jpeg().toBuffer()]);
 await expect(verifiedJpeg(decoded)).resolves.toBe(decoded);
});
test("HEIC upload: fake .heic file is rejected before decoder, not exported as JPEG",async({page})=>{
 await page.goto("/tools/heic-to-jpg?lang=en");
 const work=page.locator("main");
 await work.locator('input[type="file"]').first().setInputFiles({name:"spoofed.heic",mimeType:"image/heic",buffer:Buffer.from("the bytes are not a real HEIF image")});
 await work.getByRole("button",{name:"Convert to JPG",exact:true}).click();
 await expect(work.getByRole("alert")).toBeVisible({timeout:25000});
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
});
