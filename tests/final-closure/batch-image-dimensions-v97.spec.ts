import{test,expect}from"./export-test";
import{readFile}from"node:fs/promises";

test("batch images export exactly 359 × 195 pixels",async({page})=>{
 await page.goto("/tools/batch-image?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 const data=await page.evaluate(()=>{const canvas=document.createElement("canvas");canvas.width=10;canvas.height=8;canvas.getContext("2d")!.fillRect(0,0,10,8);return canvas.toDataURL("image/png").split(",")[1]});
 const png=Buffer.from(data,"base64");
 await input.setInputFiles({name:"tiny.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:"359 × 195 px"}).click();
 await page.locator('select').last().selectOption("image/png");
 await page.getByRole("button",{name:/Process batch/}).click();
 await expect(page.locator("[data-testid=\"result-file-actions\"]")).toBeVisible({timeout:30000});
 const promise=page.waitForEvent("download");
 await page.locator("[data-testid=\"result-file-actions\"]").getByRole("button",{name:/Save|Download/}).click();
 const download=await promise;const file=await download.path();expect(file).toBeTruthy();
 const bytes=await readFile(file!);
 expect(bytes.toString("ascii",1,4)).toBe("PNG");
 expect(bytes.readUInt32BE(16)).toBe(359);
 expect(bytes.readUInt32BE(20)).toBe(195);
});
