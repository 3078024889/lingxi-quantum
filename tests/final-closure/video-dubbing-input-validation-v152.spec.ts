import {test,expect} from "./export-test";
import {readFile} from "node:fs/promises";

// The paid mux path uses -map 0:v:0. An audio-only input cannot generate the
// advertised MP4, and must be rejected before a quote or charge can be made.
test("video dubbing rejects audio-only uploads before checkout, but accepts a real MP4",async({page})=>{
 await page.goto("/tools/video-dubbing?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 expect(await input.getAttribute("accept")).toBe("video/*");
 const wav=Buffer.alloc(44+320);
 wav.write("RIFF",0);wav.writeUInt32LE(wav.length-8,4);
 wav.write("WAVE",8);wav.write("fmt ",12);wav.writeUInt32LE(16,16);
 wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
 wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);
 wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
 wav.write("data",36);wav.writeUInt32LE(320,40);
 await input.setInputFiles({name:"audio-only.wav",mimeType:"audio/wav",buffer:wav});
 await expect(page.getByRole("alert").filter({hasText:"audio-only.wav"}).first()).toBeVisible();
 await expect(page.getByTestId("video-dubbing-checkout")).toHaveCount(0);
 const video=Buffer.from((await readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64");
 expect(video.length).toBeGreaterThan(1024);
 await input.setInputFiles({name:"supported-real.mp4",mimeType:"video/mp4",buffer:video});
 await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
 await expect(page.getByText(/supported-real\.mp4/).first()).toBeVisible();
 await expect(page.getByTestId("video-dubbing-checkout")).toBeVisible({timeout:15000});
 // A correctly labelled but corrupted MP4 must not receive a guessed one-minute quote.
 await input.setInputFiles({name:"corrupt-video.mp4",mimeType:"video/mp4",buffer:Buffer.from("not-a-playable-mp4")});
 await expect(page.getByTestId("video-dubbing-checkout")).toHaveCount(0);
 await expect(page.getByRole("alert").filter({hasText:"Unable to read the video duration"}).first()).toBeVisible({timeout:15000});
});
