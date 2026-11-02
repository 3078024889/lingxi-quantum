import {test,expect} from "./export-test";
import sharp from "sharp";
import fs from "node:fs/promises";
import JSZip from "jszip";
import type {Page} from "playwright";

async function sample(text:string){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="220"><rect width="100%" height="100%" fill="white"/><text x="36" y="128" font-size="68" font-family="DejaVu Sans" font-weight="bold" fill="black">${text}</text></svg>`;
 return sharp(Buffer.from(svg)).png().toBuffer();
}
async function paidOcr(page:Page,buffer:Buffer){
 let quoteCount=0;let quote:any=null;
 await page.route("**/api/tools/quote",r=>{
  if(r.request().method()!=="POST")return r.fulfill({status:404,body:"LOCAL_FIXTURE_ONLY"});
  const body=r.request().postDataJSON();
  expect(body.toolId).toBe("handwriting-ocr");
  quoteCount++;
  quote={id:"isolated-v146",tool_id:"handwriting-ocr",quantity:body.quantity,unit_name:"image",amount_rmb:1,amount_usd:1,display_amount:1,display_currency:body.currency,currency:body.currency,metadata:body.metadata,expires_at:new Date(Date.now()+3600000).toISOString()};
  return r.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",r=>r.fulfill({json:{paid:true,quote:{tool_id:"handwriting-ocr",quantity:quote?.quantity,metadata:quote?.metadata}}}));
 await page.goto("/tools/handwriting-ocr?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled();
 await input.setInputFiles({name:"handwritten-sample.png",mimeType:"image/png",buffer});
 await page.locator("[data-tool-workbench] select").first().selectOption("multilingual");
 await page.locator("[data-tool-workbench] select").last().selectOption("eng");
 const quoteButton=page.locator("[data-tool-workbench] button").filter({hasText:/price|价格/i}).last();
 await expect(quoteButton).toBeEnabled();
 await quoteButton.click();
 await expect(page.getByRole("button",{name:"Confirm & pay",exact:true})).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new Event("pageshow")));
 return ()=>quoteCount;
}
test("OCR: actual rasterized text is recognized by local Tesseract, exported as genuine TXT and editable DOCX",async({page})=>{
 test.setTimeout(150000);
 const calls=await paidOcr(page,await sample("HELLO PLANET"));
 const textarea=page.locator('textarea').first();
 await expect(textarea).toBeVisible({timeout:120000});
 await expect.poll(async()=>textarea.inputValue()).toMatch(/HELLO\s+PLANET/i);
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible();
 let pending=page.waitForEvent("download");await save.click();
 const textDl=await pending;
 const txt=(await fs.readFile((await textDl.path())!)).toString("utf8");
 expect(txt).toMatch(/HELLO\s+PLANET/i);
 const word=page.getByRole("button",{name:/Word|DOCX/i}).first();
 await expect(word).toBeVisible();
 pending=page.waitForEvent("download");await word.click();
 const docx=(await fs.readFile((await (await pending).path())!));
 const zip=await JSZip.loadAsync(docx);
 expect(await zip.file("word/document.xml")?.async("string")).toMatch(/HELLO\s+PLANET/i);
 expect(calls()).toBe(1);
 await expect(page.getByText("Task complete",{exact:true})).toBeVisible();
});
test("OCR: blank photo must not be accepted as completed paid export; user may retry without a new quote",async({page})=>{
 test.setTimeout(140000);
 const blank=await sharp({create:{width:600,height:180,channels:3,background:"white"}}).png().toBuffer();
 const calls=await paidOcr(page,blank);
 const retry=page.getByRole("button",{name:"Resume paid task",exact:true});
 await expect(retry).toBeVisible({timeout:120000});
 await expect(page.getByText("No readable text was found.",{exact:false})).toBeVisible();
 await expect(page.getByText("Task complete",{exact:true})).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 expect(calls()).toBe(1);
});
