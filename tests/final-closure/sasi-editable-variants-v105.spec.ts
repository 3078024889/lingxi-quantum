import {test,expect} from "./export-test";
import fs from "node:fs/promises";

test("SASI owned variant workflow compiles and exports 100 editable plans with no paid calls",async({page})=>{
 const charged:string[]=[];
 page.on("request",req=>{if(/\/api\/sasi\/.*(?:video|byok|plan|image)/.test(req.url()))charged.push(req.url())});
 await page.goto("/sasi/variants?lang=en");
 await expect(page.getByRole("heading",{name:/SASI editable video workflow/})).toBeVisible();
 await page.getByRole("spinbutton",{name:"Variants (1–100)"}).fill("100");
 await page.getByRole("button",{name:"Compile variants"}).click();
 await expect(page.getByText(/Editable storyboards compiled: 100/)).toBeVisible();
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Export editable JSON"}).click();
 const file=await pending;
 const result=JSON.parse((await fs.readFile((await file.path())!)).toString("utf8"));
 expect(result.format).toBe("lingxifield.sasi.storyboard.v1");
 expect(result.timing).toBe("estimated-word-positions-not-audio-alignment");
 expect(result.variants).toHaveLength(100);
 expect(new Set(result.variants.map((v:any)=>v.editRecipe.camera+"|"+v.editRecipe.rhythm)).size).toBe(100);
 expect(result.variants[0].scenes).toHaveLength(3);
 expect(result.variants[0].totalSeconds).toBe(24);
 expect(charged).toEqual([]);
});
test("SASI variant reference stays local and requires creator rights",async({page})=>{
 await page.goto("/sasi/variants?lang=en");
 await page.getByLabel("Reference video (local preview only)").setInputFiles({name:"my-reference.mp4",mimeType:"video/mp4",buffer:Buffer.from("local-fixture-only")});
 await page.getByRole("button",{name:"Compile variants"}).click();
 await expect(page.getByRole("alert").filter({hasText:"rights needed"})).toContainText("rights needed");
 await page.getByRole("checkbox").check();
 await page.getByRole("button",{name:"Compile variants"}).click();
 await expect(page.getByText(/Editable storyboards compiled: 3/)).toBeVisible();
 await expect(page.locator("video")).toHaveCount(1);
});
test("SASI variant workbench exposes nine localized creation controls",async({page})=>{
 const labels=[["zh","编排变体"],["en","Compile variants"],["ja","構成を生成"],["ko","변형 만들기"],["fr","Composer les variantes"],["de","Varianten erstellen"],["es","Crear variantes"],["pt","Criar variações"],["ar","إنشاء النسخ"]];
 for(const [lang,label] of labels){
  await page.goto("/sasi/variants?lang="+lang);
  await expect(page.getByRole("button",{name:label,exact:true})).toBeVisible({timeout:20000});
  if(lang==="ar")await expect(page.locator("html")).toHaveAttribute("dir","rtl");
 }
});
