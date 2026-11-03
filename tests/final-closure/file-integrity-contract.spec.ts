import {test,expect,type Page} from "./export-test";
import {createHash} from "node:crypto";
import {PDFDocument} from "pdf-lib";

async function uploadAndRun(page:Page,slug:string,parts:Array<{name:string;mimeType:string;buffer:Buffer}>){
 await page.goto("/tools/"+slug+"?lang=en");
 const input=page.locator('[data-tool-workbench] input[type=file]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles(parts);
 await page.getByRole("button",{name:"Process now",exact:true}).click();
}

test("real file signature detects JPEG disguised with PDF filename, not its claimed extension",async({page})=>{
 const image=await page.evaluate(()=>{
  const canvas=document.createElement("canvas");canvas.width=24;canvas.height=16;
  const x=canvas.getContext("2d")!;x.fillStyle="#bada55";x.fillRect(0,0,24,16);
  return canvas.toDataURL("image/jpeg").split(",")[1];
 });
 await uploadAndRun(page,"file-type-detector",[{name:"invoice.pdf",mimeType:"application/pdf",buffer:Buffer.from(image,"base64")}]);
 await expect(page.getByText("Detected: JPEG image. The filename does not match the file type.",{exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("real PDF magic bytes match valid PDF label and are distinguished from unknown binary",async({page})=>{
 const doc=await PDFDocument.create();doc.addPage([220,320]);
 await uploadAndRun(page,"file-type-detector",[{name:"sample.pdf",mimeType:"application/pdf",buffer:Buffer.from(await doc.save())}]);
 await expect(page.getByText("Detected: PDF document. The filename matches the file type.",{exact:true})).toBeVisible();
 await uploadAndRun(page,"file-type-detector",[{name:"broken.pdf",mimeType:"application/pdf",buffer:Buffer.from("arbitrary random data") }]);
 await expect(page.getByText("File format could not be identified. Please check that the file is complete.",{exact:true})).toBeVisible();
});

test("real MD5 and SHA256 match independent Node crypto for Unicode bytes",async({page})=>{
 const bytes=Buffer.from("Celestial 小仙女 — 星咕咕 🌌\nsecond line","utf8");
 await uploadAndRun(page,"md5-sha256",[{name:"utf8.txt",mimeType:"text/plain",buffer:bytes}]);
 const md5=createHash("md5").update(bytes).digest("hex"),sha=createHash("sha256").update(bytes).digest("hex");
 await expect(page.getByText("File verification hashes are ready.",{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText(md5,{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText(sha,{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText(String(bytes.length),{exact:true})).toBeVisible();
});

test("real two-file comparison distinguishes identical bytes despite different filenames",async({page})=>{
 const bytes=Buffer.from("Celestial and 星咕咕", "utf8");
 await uploadAndRun(page,"file-compare",[
  {name:"left.txt",mimeType:"text/plain",buffer:bytes},
  {name:"right.txt",mimeType:"text/plain",buffer:bytes}
 ]);
 await expect(page.getByText("The two files are identical.",{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText("true",{exact:true})).toHaveCount(2);
 await expect(page.locator("dl").getByText(createHash("sha256").update(bytes).digest("hex"),{exact:true})).toHaveCount(2);
});

test("real two-file comparison detects same-length changed content and fails closed for one file",async({page})=>{
 const left=Buffer.from("AABBCCDDEE"),right=Buffer.from("AABBCXDDEE");
 await uploadAndRun(page,"file-compare",[
  {name:"left.bin",mimeType:"application/octet-stream",buffer:left},
  {name:"right.bin",mimeType:"application/octet-stream",buffer:right}
 ]);
 await expect(page.getByText("The two files differ.",{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText("false",{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText(createHash("sha256").update(left).digest("hex"),{exact:true})).toBeVisible();
 await expect(page.locator("dl").getByText(createHash("sha256").update(right).digest("hex"),{exact:true})).toBeVisible();
 await uploadAndRun(page,"file-compare",[{name:"only.bin",mimeType:"application/octet-stream",buffer:left}]);
 await expect(page.getByText("Please select two files to compare.",{exact:true})).toBeVisible();
});
