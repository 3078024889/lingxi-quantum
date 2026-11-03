import {test,expect} from "./export-test";
import sharp from "sharp";
import fs from "node:fs/promises";

// Real browser Tesseract WASM + language assets: no synthetic OCR API response.
// The downloaded text is parsed independently after the exact UI interaction.
test("ocr: genuine English text rendered in PNG is recognized, exported and invalidated on language change",async({page})=>{
 test.setTimeout(180000);
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="240"><rect width="100%" height="100%" fill="white"/><text x="56" y="164" font-family="DejaVu Sans,Arial,sans-serif" font-size="114" font-weight="bold" fill="black">HELLO 123</text></svg>';
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 await page.goto("/tools/ocr?lang=en");
 const work=page.locator("[data-tool-workbench]");
 await work.locator('input[type="file"]').first().setInputFiles({name:"printed.png",mimeType:"image/png",buffer:png});
 await work.locator("select").first().selectOption("eng");
 await work.getByRole("button",{name:"Extract text",exact:true}).click();
 const result=work.getByTestId("result-file-actions").first();
 await expect(result).toBeVisible({timeout:150000});
 const pending=page.waitForEvent("download");
 await result.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;expect(await dl.failure()).toBeNull();
 const text=(await fs.readFile((await dl.path())!,"utf8")).replace(/\s+/g," ").toUpperCase();
 expect(text).toContain("HELLO");
 expect(text).toContain("123");
 await work.locator("select").first().selectOption("fra+eng");
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
});
test("ocr: genuine blank image refuses an empty-text download",async({page})=>{
 test.setTimeout(180000);
 const blank=await sharp({create:{width:500,height:240,channels:3,background:"white"}}).png().toBuffer();
 await page.goto("/tools/ocr?lang=en");
 const work=page.locator("[data-tool-workbench]");
 await work.locator('input[type="file"]').first().setInputFiles({name:"blank.png",mimeType:"image/png",buffer:blank});
 await work.locator("select").first().selectOption("eng");
 await work.getByRole("button",{name:"Extract text",exact:true}).click();
 await expect(work.getByRole("alert")).toBeVisible({timeout:150000});
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
});