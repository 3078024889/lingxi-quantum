import {test,expect} from "./export-test";
for(const slug of ["heic-local","heic-to-jpg"]){
 test(`${slug} rejects non-HEIC bytes without false conversion or downloadable file`,async({page})=>{
  test.setTimeout(90000);
  await page.goto("/tools/"+slug+"?lang=en");
  const area=page.locator("[data-tool-workbench]");
  const input=area.locator('input[type="file"]').first();
  await expect(input).toBeEnabled({timeout:15000});
  await input.setInputFiles({name:"not-a-photo.heic",mimeType:"image/heic",buffer:Buffer.from("this is not a real HEIC HEVC image")});
  const btn=slug==="heic-local"?page.getByRole("button",{name:"Convert to JPG",exact:true}):page.getByRole("button",{name:"Process now",exact:true});
  await expect(btn).toBeEnabled();
  await btn.click();
  // FileToolWorkbench uses ErrorExplain, a visible error card without role="alert".
  await expect(area.getByText("Could not finish this time",{exact:true})).toBeVisible({timeout:50000});
  await expect(area.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 });
}
