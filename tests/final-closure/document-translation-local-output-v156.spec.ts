import {test,expect} from "./export-test";
import fs from "node:fs/promises";

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
