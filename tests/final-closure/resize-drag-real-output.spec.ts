import {test,expect,type Page} from "./export-test";
import {readFile} from "node:fs/promises";
import sharp from "sharp";

async function openSplitImage(page:Page,drop=false){
 await page.goto("/tools/resize-image?lang=en");
 const image=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=400;c.height=200;
  const x=c.getContext("2d")!;
  x.fillStyle="#f80000";x.fillRect(0,0,200,200);
  x.fillStyle="#0000f8";x.fillRect(200,0,200,200);
  return c.toDataURL("image/png").split(",")[1];
 });
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 if(drop){
  const dataTransfer=await page.evaluateHandle((bytes)=>{
   const transfer=new DataTransfer();
   transfer.items.add(new File([Uint8Array.from(atob(bytes),c=>c.charCodeAt(0))],"red-blue.png",{type:"image/png"}));
   return transfer;
  },image);
  await input.locator("..").dispatchEvent("drop",{dataTransfer});
  await dataTransfer.dispose();
 }else{
  await input.setInputFiles({name:"red-blue.png",mimeType:"image/png",buffer:Buffer.from(image,"base64")});
 }
 await expect(page.getByText("Source 400×200",{exact:true})).toBeVisible({timeout:15000});
}
async function imageAtSave(page:Page){
 await page.getByRole("button",{name:/^Process 1 image/}).click();
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:20000});
 const waiting=page.waitForEvent("download");
 await save.click();const downloaded=await waiting;
 expect(downloaded.suggestedFilename()).toMatch(/\.png$/);
 const bytes=await readFile((await downloaded.path())!);
 const {data,info}=await sharp(bytes).raw().toBuffer({resolveWithObject:true});
 expect([info.width,info.height]).toEqual([100,100]);
 const at=(x:number,y:number)=>{
  const i=(y*info.width+x)*info.channels;
  return [...data.subarray(i,i+3)];
 };
 return {name:downloaded.suggestedFilename(),sample:at(10,50)};
}

test("dragging a crop on the real preview moves the actual saved pixels and invalidates previous output",async({page})=>{
 test.setTimeout(90000);
 await openSplitImage(page);
 await page.getByRole("button",{name:"Free",exact:true}).click();
 await page.getByText("Exact pixels (optional)",{exact:true}).click();
 await page.getByLabel("Width px",{exact:true}).fill("100");
 await page.getByLabel("Height px",{exact:true}).fill("100");
 await page.getByRole("button",{name:/^Manual crop/}).click();
 await page.getByRole("combobox",{name:"Output format",exact:true}).selectOption("image/png");
 const preview=page.getByTestId("resize-drag-preview");
 await expect(preview).toHaveAttribute("data-fit","cover");
 await expect(preview.locator('img[src^="blob:"]')).toBeVisible({timeout:15000});
 await expect(page.getByText("Drag the image to choose what stays in frame.",{exact:true})).toBeVisible();
 await expect(page.getByText("Fine-tune position (optional)",{exact:true})).toBeVisible();
 await preview.scrollIntoViewIfNeeded();
 const rect=await preview.boundingBox();if(!rect)throw Error("PREVIEW_NOT_VISIBLE");
 // The viewport, not the natural image dimensions, determines the crop ratio.
 expect(Math.abs(rect.width-rect.height)).toBeLessThan(4);
 const y=rect.y+rect.height/2;
 await page.mouse.move(rect.x+rect.width*.5,y);
 await page.mouse.down();
 await page.mouse.move(rect.x+rect.width*.02,y,{steps:10});
 await page.mouse.up();
 await expect.poll(async()=>Number(await preview.getAttribute("data-focus-x"))).toBeGreaterThan(90);
 const blue=await imageAtSave(page);
 expect(blue.name).toBe("red-blue.png");
 expect(blue.sample[0]).toBeLessThan(30);
 expect(blue.sample[2]).toBeGreaterThan(220);

 await preview.scrollIntoViewIfNeeded();
 const afterDownload=await preview.boundingBox();if(!afterDownload)throw Error("PREVIEW_NOT_VISIBLE_AFTER_DOWNLOAD");
 const y2=afterDownload.y+afterDownload.height/2;
 await page.mouse.move(afterDownload.x+afterDownload.width*.05,y2);
 await page.mouse.down();
 await page.mouse.move(afterDownload.x+afterDownload.width*.97,y2,{steps:10});
 await page.mouse.up();
 await expect.poll(async()=>Number(await preview.getAttribute("data-focus-x"))).toBeLessThan(10);
 // The prior blue ZIP/image is no longer available after changing the frame.
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 const red=await imageAtSave(page);
 expect(red.sample[0]).toBeGreaterThan(220);
 expect(red.sample[2]).toBeLessThan(30);
});

test("changing size, format, fit and output quality hides stale exports; PNG has no misleading quality slider",async({page})=>{
 test.setTimeout(90000);
 await openSplitImage(page);
 await page.getByRole("button",{name:"Free",exact:true}).click();
 await page.getByText("Exact pixels (optional)",{exact:true}).click();
 await page.getByLabel("Width px",{exact:true}).fill("100");
 await page.getByLabel("Height px",{exact:true}).fill("100");
 await page.getByRole("button",{name:/^Stretch/}).click();
 const output=page.getByRole("combobox",{name:"Output format",exact:true});
 await output.selectOption("image/png");
 await expect(page.locator("label").filter({hasText:/^Quality\s+\d+%$/})).toHaveCount(0);
 await page.getByRole("button",{name:/^Process 1 image/}).click();
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:20000});
 await page.getByRole("button",{name:/512×512/}).click();
 await expect(save).toHaveCount(0);
 await page.getByRole("button",{name:/1080×1920/}).click();
 const portrait=await page.getByTestId("resize-drag-preview").boundingBox();
 if(!portrait)throw Error("PORTRAIT_PREVIEW_NOT_VISIBLE");
 expect(Math.abs(portrait.width/portrait.height-9/16)).toBeLessThan(0.02);
 await output.selectOption("image/jpeg");
 await expect(page.locator("label").filter({hasText:/^Quality\s+\d+%$/})).toBeVisible();
 await page.getByRole("button",{name:/^Manual crop/}).click();
 await page.getByLabel("Allow enlargement",{exact:true}).uncheck();
 await expect(save).toHaveCount(0);
});

test("a corner gesture updates the real export dimensions without opening number inputs",async({page},testInfo)=>{
 test.setTimeout(90000);
 await openSplitImage(page,true);
 await expect(page.getByLabel("Width px",{exact:true})).toBeHidden();
 const size=page.getByTestId("resize-output-size");
 await expect(size).toHaveText("400×300 px");
 const handle=page.getByTestId("resize-size-grip");
 await handle.scrollIntoViewIfNeeded();
 const rect=await handle.boundingBox();
 if(!rect)throw Error("SIZE_HANDLE_MISSING");
 const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
 if(testInfo.project.name.includes("mobile")){
  const cdp=await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
  await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x-45,y:y-35}]});
  await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await cdp.detach();
 }else{
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x-45,y-35,{steps:10});
  await page.mouse.up();
 }
 await expect(size).not.toHaveText("400×300 px");
 const dimensions=(await size.innerText()).match(/\d+/g)?.map(Number);
 expect(dimensions).toHaveLength(2);
 expect(dimensions![0]).toBeLessThan(400);
 expect(dimensions![0]/dimensions![1]).toBeCloseTo(4/3,2);
 await page.getByRole("combobox",{name:"Output format",exact:true}).selectOption("image/png");
 await page.getByRole("button",{name:/^Process 1 image/}).click();
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 const pending=page.waitForEvent("download");
 await save.click();
 const download=await pending;
 const info=await sharp(await readFile((await download.path())!)).metadata();
 expect([info.width,info.height]).toEqual(dimensions);
});
