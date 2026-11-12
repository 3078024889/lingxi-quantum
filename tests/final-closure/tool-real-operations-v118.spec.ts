import {test,expect} from "./export-test";
import {createHash} from "node:crypto";
import sharp from "sharp";

const textCases=[
 {slug:"text-counter",source:"汉字 Hello\nHello",expected:"Characters (including whitespace): 14\nCharacters (excluding whitespace): 12\nHan characters: 2\nEnglish words: 2\nLines: 2\nUTF-8 bytes: 18"},
 {slug:"remove-duplicate-lines",source:"A\nB\nA\n  A\nB\n",expected:"A\nB\n  A\n"},
 {slug:"remove-empty-lines",source:" first \n\n  \nsecond\n",expected:" first \nsecond"},
 {slug:"url-encode-decode",source:"星空 &?=+",expected:encodeURIComponent("星空 &?=+")},
 {slug:"base64-encode-decode",source:"你好, Celestial 🔮",expected:Buffer.from("你好, Celestial 🔮","utf8").toString("base64")},
] as const;

for(const item of textCases)test(`tool ${item.slug}: a real browser transforms Unicode input without losing the original`,async({page})=>{
 await page.goto(`/tools/${item.slug}?lang=en`);
 const area=page.locator("[data-tool-workbench]");
 const input=area.locator("textarea").first(),output=area.locator("textarea[readonly]");
 await expect(input).toBeVisible();
 await input.fill(item.source);
 await area.getByRole("button",{name:"Start processing"}).click();
 await expect(output).toHaveValue(item.expected);
 await expect(input).toHaveValue(item.source);
 await expect(area.getByRole("status")).toContainText("Processing complete");
 if(item.slug==="url-encode-decode"||item.slug==="base64-encode-decode"){
  await area.locator("select").selectOption("decode");
  await expect(output).toHaveValue("");
  await expect(area.getByRole("status")).toBeEmpty();
  await input.fill(item.expected);
  await area.getByRole("button",{name:"Start processing"}).click();
  await expect(output).toHaveValue(item.source);
 }
});

test("tool Base64: malformed UTF-8 reports an error rather than a forged decoded result",async({page})=>{
 await page.goto("/tools/base64-encode-decode?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator("select").selectOption("decode");
 await area.locator("textarea").first().fill("////");
 await area.getByRole("button",{name:"Start processing"}).click();
 await expect(area.locator("textarea[readonly]")).toHaveValue("");
 await expect(area.getByRole("status")).toContainText("Could not process");
});

test("tool JSON formatter: exact large integers and repeated keys survive pretty/minify",async({page})=>{
 const original='{"big":123456789012345678901234567890,"big":2,"text":"a,b"}';
 await page.goto("/tools/json-formatter?lang=en");
 const area=page.locator("[data-tool-workbench]"),source=area.locator("textarea").first();
 await source.fill(original);
 await area.getByRole("button",{name:"Pretty print"}).click();
 const pretty=await source.inputValue();
 expect(pretty).toContain("123456789012345678901234567890");
 expect(pretty.match(/"big"/g)).toHaveLength(2);
 expect(pretty).toContain('"text": "a,b"');
 await area.getByRole("button",{name:"Minify"}).click();
 await expect(source).toHaveValue(original);
 await source.fill('{"bad":}');
 await area.getByRole("button",{name:"Pretty print"}).click();
 await expect(area).toContainText("Invalid JSON");
});

test("tool timestamp converter: UTC epoch converts correctly; empty value is invalid",async({page})=>{
 await page.goto("/tools/timestamp-converter?lang=en");
 const area=page.locator("[data-tool-workbench]");
 const field=area.locator('input:not([type="radio"])').first();
 await field.fill("0");
 await expect(area.locator("dl")).toContainText("1970-01-01T00:00:00.000Z");
 await field.fill(" ");
 await expect(area).toContainText("Could not parse this time value");
 await expect(area.locator("dl")).toHaveCount(0);
 await field.fill("1700000000000");
 await area.locator("select").first().selectOption("ms");
 await expect(area.locator("dl")).toContainText("2023-11-14T22:13:20.000Z");
});

test("tool hash: uploaded UTF-8 bytes produce the independently computed MD5 and SHA256",async({page})=>{
 const bytes=Buffer.from("checksum 星河\n","utf8");
 await page.goto("/tools/md5-sha256?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"hash-星河.txt",mimeType:"text/plain",buffer:bytes});
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.locator("dl")).toContainText(createHash("md5").update(bytes).digest("hex"));
 await expect(area.locator("dl")).toContainText(createHash("sha256").update(bytes).digest("hex"));
});

test("tool file type: a PNG renamed to .jpg is identified by its bytes, not filename",async({page})=>{
 const png=await sharp({create:{width:9,height:7,channels:3,background:"#234567"}}).png().toBuffer();
 await page.goto("/tools/file-type-detector?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"fake.jpg",mimeType:"image/jpeg",buffer:png});
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area).toContainText(/PNG/i);
 await expect(area).toContainText("filename does not match");
});

test("tool compare: two different files with identical names, sizes and timestamps remain distinct",async({page})=>{
 await page.goto("/tools/file-compare?lang=en");
 const area=page.locator("[data-tool-workbench]");
 const input=area.locator('input[type="file"]').first();
 await expect(input).toBeEnabled();
 await input.evaluate((node:HTMLInputElement)=>{
  const dt=new DataTransfer();
  for(const data of ["ABC","XYZ"])dt.items.add(new File([data],"same.bin",{type:"application/octet-stream",lastModified:1700000000000}));
  node.files=dt.files;node.dispatchEvent(new Event("change",{bubbles:true}));
 });
 await expect(area.locator("li").filter({hasText:"same.bin"})).toHaveCount(2);
 await area.getByRole("button",{name:"Process now"}).click();
 const details=area.locator("dl");
 await expect(details.locator("dt").filter({hasText:/^sameSize$/}).locator("..").locator("dd")).toHaveText("true");
 await expect(details.locator("dt").filter({hasText:/^identical$/}).locator("..").locator("dd")).toHaveText("false");
 const digestA=createHash("sha256").update("ABC").digest("hex");
 const digestB=createHash("sha256").update("XYZ").digest("hex");
 await expect(details).toContainText(digestA);await expect(details).toContainText(digestB);
});

test("tool compare: two truly identical same-named files are compared, not silently dropped",async({page})=>{
 await page.goto("/tools/file-compare?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().evaluate((node:HTMLInputElement)=>{
  const dt=new DataTransfer();
  for(let i=0;i<2;i++)dt.items.add(new File(["identical"],"same.txt",{type:"text/plain",lastModified:1700000000000}));
  node.files=dt.files;node.dispatchEvent(new Event("change",{bubbles:true}));
 });
 await expect(area.locator("li").filter({hasText:"same.txt"})).toHaveCount(2);
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.locator("dt").filter({hasText:/^identical$/}).locator("..").locator("dd")).toHaveText("true");
});
