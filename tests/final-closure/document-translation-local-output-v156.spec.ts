import {test,expect} from "./export-test";
import fs from "node:fs/promises";
import JSZip from "jszip";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";

// Provider response is isolated deliberately. Parsing, UI state, formatting,
// real browser download and byte-for-byte output validation are exercised.
// This does NOT attest a third-party translation provider or a payment.
test("document translation: real UTF-8 text round-trip preserves line breaks and clears stale output when target changes",async({page})=>{
 test.setTimeout(90000);
 let providerCalls=0;
 await page.route("**/api/tools/document-translate",async route=>{
  providerCalls++;
  const request=route.request().postDataJSON();
  if(!Array.isArray(request.segments)||request.target!=="ja")throw Error("UNEXPECTED_TRANSLATION_REQUEST");
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
   segments:request.segments.map((segment:{id:string;text:string})=>({
    id:segment.id,text:"訳文["+segment.text+"]"
   })),
   billing:"included-experience"
  })});
 });
 await page.goto("/tools/document-translate?lang=en");
 const input=page.locator('input[type="file"]').first();
 const text="Hello 42 travelers!\nSubtotal USD 9.50\nKeep 2026-11-03 unchanged.\n";
 await input.setInputFiles({name:"memo.txt",mimeType:"text/plain",buffer:Buffer.from(text,"utf8")});
 await page.getByRole("combobox",{name:/Target/i}).selectOption("ja");
 await page.getByRole("button",{name:"Translate",exact:true}).click();
 const actions=page.getByTestId("result-file-actions").first();
 await expect(actions).toBeVisible({timeout:40000});
 const waiting=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const downloaded=await waiting;
 expect(await downloaded.failure()).toBeNull();
 const bytes=await fs.readFile((await downloaded.path())!);
 const utf8=bytes.toString("utf8");
 expect(downloaded.suggestedFilename()).toBe("ja-memo.txt");
 expect(utf8).toBe("訳文[Hello 42 travelers!]\n訳文[Subtotal USD 9.50]\n訳文[Keep 2026-11-03 unchanged.]\n");
 expect(providerCalls).toBe(1);
 await page.getByRole("combobox",{name:/Target/i}).selectOption("fr");
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Translate",exact:true})).toBeEnabled();
});

test("document translation: changing glossary invalidates old translated downloadable file",async({page})=>{
 test.setTimeout(90000);
 await page.route("**/api/tools/document-translate",async route=>{
  const body=route.request().postDataJSON();
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
   segments:body.segments.map((s:{id:string;text:string})=>({id:s.id,text:"bonjour "+s.text}))
  })});
 });
 await page.goto("/tools/document-translate?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"greeting.txt",mimeType:"text/plain",buffer:Buffer.from("Please translate this sentence.")});
 await page.getByRole("button",{name:"Translate",exact:true}).click();
 await expect(page.getByTestId("result-file-actions")).toBeVisible({timeout:35000});
 await page.getByRole("textbox",{name:/Glossary/i}).fill("hello = bonjour");
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
});

test("document translation: real docx OOXML round-trip preserves bold and heading styles, changes only text nodes",async({page})=>{
 test.setTimeout(90000);
 const zip=new JSZip();
 const original='<?xml version="1.0" encoding="UTF-8"?>'+
  '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'+
  '<w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>'+
  '<w:r><w:rPr><w:b/></w:rPr><w:t>Alpha heading</w:t></w:r></w:p>'+
  '<w:p><w:r><w:t>Second paragraph</w:t></w:r></w:p></w:body></w:document>';
 const untouched='<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:styleId="Heading1"/></w:styles>';
 zip.file("word/document.xml",original);
 zip.file("word/styles.xml",untouched);
 zip.file("[Content_Types].xml",'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>');
 zip.file("_rels/.rels",'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
 const source=await zip.generateAsync({type:"nodebuffer",compression:"DEFLATE"});
 let calls=0;
 await page.route("**/api/tools/document-translate",async route=>{
  calls++;
  const body=route.request().postDataJSON();
  expect(body.target).toBe("fr");
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
   segments:body.segments.map((item:{id:string;text:string})=>({id:item.id,text:"FR-"+item.text}))
  })});
 });
 await page.goto("/tools/document-translate?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({
  name:"styles.docx",
  mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  buffer:source
 });
 await page.getByRole("combobox",{name:/Target/i}).selectOption("fr");
 await page.getByRole("button",{name:"Translate",exact:true}).click();
 const actions=page.getByTestId("result-file-actions").first();
 await expect(actions).toBeVisible({timeout:40000});
 const waiting=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await waiting;
 expect(await dl.failure()).toBeNull();
 expect(dl.suggestedFilename()).toBe("fr-styles.docx");
 const result=await JSZip.loadAsync(await fs.readFile((await dl.path())!));
 const translated=await result.file("word/document.xml")!.async("string");
 expect(translated).toContain("FR-Alpha heading");
 expect(translated).toContain("FR-Second paragraph");
 expect(translated).toContain('<w:pStyle w:val="Heading1"/>');
 expect(translated).toContain("<w:b/>");
 expect(await result.file("word/styles.xml")!.async("string")).toBe(untouched);
 expect(calls).toBe(1);
});

test("document translation: actual two-page PDF bilingual export contains four decodable pages, reselecting layout removes old output",async({page})=>{
 test.setTimeout(140000);
 const pdf=await PDFDocument.create();
 const font=await pdf.embedFont(StandardFonts.Helvetica);
 for(const word of ["Hello one","Hello two"]){
  const p=pdf.addPage([595,842]);
  p.drawRectangle({x:38,y:728,width:260,height:60,color:rgb(0.96,0.96,0.96)});
  p.drawText(word,{x:60,y:753,font,size:18,color:rgb(0.05,0.05,0.05)});
 }
 const raw=Buffer.from(await pdf.save());
 let calls=0;
 await page.route("**/api/tools/document-translate",async route=>{
  calls++;
  const body=route.request().postDataJSON();
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
   segments:body.segments.map((s:{id:string;text:string})=>({
    id:s.id,text:s.text.replace("Hello","Salut")
   }))
  })});
 });
 await page.goto("/tools/document-translate?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({
  name:"two-pages.pdf",mimeType:"application/pdf",buffer:raw
 });
 await page.getByRole("combobox",{name:/Target/i}).selectOption("fr");
 await page.locator('select[aria-label="PDF"]').selectOption("bilingual");
 await page.getByRole("button",{name:"Translate",exact:true}).click();
 const action=page.getByTestId("result-file-actions").first();
 await expect(action).toBeVisible({timeout:100000});
 const pending=page.waitForEvent("download");
 await action.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;
 expect(await dl.failure()).toBeNull();
 expect(dl.suggestedFilename()).toBe("fr-two-pages.pdf");
 const bytes=await fs.readFile((await dl.path())!);
 expect(bytes.subarray(0,5).toString("ascii")).toBe("%PDF-");
 const checked=await PDFDocument.load(bytes);
 expect(checked.getPageCount()).toBe(4);
 for(const p of checked.getPages()){
  expect(p.getWidth()).toBe(595);
  expect(p.getHeight()).toBe(842);
 }
 expect(calls).toBeGreaterThan(0);
 await page.locator('select[aria-label="PDF"]').selectOption("layout");
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
});
