import {test,expect} from "./export-test";
import {readFile} from "node:fs/promises";
import {mediaDurationCopy} from "../../lib/tools/media/duration-copy";

test("nine-language media pricing feedback is present for loading and invalid footage",()=>{
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
  expect(mediaDurationCopy(lang,"loading").length).toBeGreaterThan(10);
  expect(mediaDurationCopy(lang,"invalid").length).toBeGreaterThan(15);
 }
});

test("paid video translation requires actual video duration and invalidates stale quotes on replacement",async({page})=>{
 await page.goto("/tools/video-translate?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 const video=Buffer.from((await readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64");
 expect(video.length).toBeGreaterThan(1024);
 await input.setInputFiles({name:"measured.mp4",mimeType:"video/mp4",buffer:video});
 const checkout=page.getByTestId("video-translate-checkout");
 await expect(checkout).toBeVisible({timeout:30000});
 await expect(page.getByText(/1 × 1 = 1/)).toBeVisible();
 await input.setInputFiles({name:"corrupt.mp4",mimeType:"video/mp4",buffer:Buffer.from("invalid-video-stream")});
 await expect(checkout).toHaveCount(0);
 await expect(page.getByRole("alert").filter({hasText:"Unable to read the video duration"}).first()).toBeVisible({timeout:15000});
 await input.setInputFiles({name:"recovered.mp4",mimeType:"video/mp4",buffer:video});
 await expect(checkout).toBeVisible({timeout:30000});
});
