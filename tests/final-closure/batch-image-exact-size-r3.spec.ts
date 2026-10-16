import{test,expect}from"./export-test";import{readFile}from"node:fs/promises";import sharp from"sharp";
test("batch image exact custom size exports requested pixels",async({page})=>{
 await page.goto("/tools/batch-image?lang=en");const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled({timeout:15000});
 const png=await page.evaluate(()=>{const c=document.createElement("canvas");c.width=640;c.height=480;c.getContext("2d")!.fillRect(0,0,640,480);return c.toDataURL("image/png").split(",")[1]});
 await input.setInputFiles({name:"source.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
 await page.locator("select").first().selectOption("exact");const spins=page.getByRole("spinbutton");await spins.nth(0).fill("200");await spins.nth(1).fill("200");
 await page.getByRole("button",{name:"Process batch",exact:true}).click();await expect(page.getByRole("button",{name:"Save file",exact:true})).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");await page.getByRole("button",{name:"Save file",exact:true}).first().click();const dl=await pending,path=await dl.path();expect(path).not.toBeNull();
 const meta=await sharp(await readFile(path!)).metadata();expect(meta.width).toBe(200);expect(meta.height).toBe(200);
});