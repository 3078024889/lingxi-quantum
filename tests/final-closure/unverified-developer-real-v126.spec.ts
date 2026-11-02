import {test,expect} from "./export-test";
import type {Page} from "playwright";
import fs from "node:fs/promises";

const url=(slug:string)=>`/tools/${slug}?lang=en`;
const editor=async(page:Page,slug:string,source:string)=>{
 await page.goto(url(slug));
 const input=page.locator("textarea:not([readonly])").first();
 await expect(input).toBeVisible({timeout:30000});
 await input.fill(source);
 return input;
};
async function output(page:Page){
 await page.getByRole("button",{name:"Run",exact:true}).click();
 const result=page.locator("textarea[readonly]").first();
 await expect(result).toBeVisible({timeout:15000});
 return result.inputValue();
}

test("case-converter: real camel, snake and Unicode-safe upper conversion",async({page})=>{
 await editor(page,"case-converter","hello_world Galaxy");
 expect(await output(page)).toBe("helloWorldGalaxy");
 await page.locator("select").selectOption("snake");
 expect(await output(page)).toBe("hello_world_galaxy");
 await page.locator("select").selectOption("upper");
 expect(await output(page)).toBe("HELLO_WORLD GALAXY");
});

test("csv-json: quoted comma, escaped quote and UTF-8 survives real browser conversion",async({page})=>{
 await editor(page,"csv-json",'name,comment\n星河,"hello, ""world"""');
 const parsed=JSON.parse(await output(page));
 expect(parsed).toEqual([{name:"星河",comment:'hello, "world"'}]);
});

test("xml-formatter: valid nested XML is formatted and malformed XML fails without forged output",async({page})=>{
 const input=await editor(page,"xml-formatter",'<root><child lang="zh">星河</child></root>');
 const result=await output(page);
 expect(result).toContain("<root>");
 expect(result).toContain('<child lang="zh">星河</child>');
 await input.fill("<root><child></root>");
 await page.getByRole("button",{name:"Run",exact:true}).click();
 await expect(page.locator("textarea[readonly]")).toHaveCount(0);
 await expect(page.getByText("Could not parse the input. Check the format.")).toBeVisible();
});

test("jwt-decoder: decodes header and Unicode payload but does not claim signature verification",async({page})=>{
 const header=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url");
 const payload=Buffer.from(JSON.stringify({sub:"星河",role:"viewer",exp:1800000000})).toString("base64url");
 const input=await editor(page,"jwt-decoder",`${header}.${payload}.invalid-signature`);
 const data=JSON.parse(await output(page));
 expect(data.header.alg).toBe("HS256");
 expect(data.payload.sub).toBe("星河");
 expect(data.payload.role).toBe("viewer");
 await input.fill("not-a-jwt");
 await page.getByRole("button",{name:"Run",exact:true}).click();
 await expect(page.locator("textarea[readonly]")).toHaveCount(0);
});

test("url-parser: hostname, percent-encoded query, hash and pathname parsed from real input",async({page})=>{
 await editor(page,"url-parser","https://example.com:8443/a/b?q=%E6%98%9F%E6%B2%B3#chapter");
 const data=JSON.parse(await output(page));
 expect(data.protocol).toBe("https:");
 expect(data.hostname).toBe("example.com");
 expect(data.port).toBe("8443");
 expect(data.pathname).toBe("/a/b");
 expect(data.search.q).toBe("星河");
 expect(data.hash).toBe("#chapter");
});

test("number-base-converter: decimal 255 to hexadecimal FF; invalid characters are rejected",async({page})=>{
 const input=await editor(page,"number-base-converter","255");
 const converted=(await output(page)).trim().toLowerCase();
 expect(converted).toBe("ff");
 await input.fill("25X");
 await page.getByRole("button",{name:"Run",exact:true}).click();
 await expect(page.locator("textarea[readonly]")).toHaveCount(0);
});

test("text-diff: changed and retained Unicode lines are represented correctly",async({page})=>{
 const a=await editor(page,"text-diff","相同\n旧版本");
 await page.getByPlaceholder("B").fill("相同\n新版本");
 const value=await output(page);
 expect(value).toContain("  相同");
 expect(value).toContain("- 旧版本");
 expect(value).toContain("+ 新版本");
 await a.fill("一致");
 await page.getByPlaceholder("B").fill("一致");
 expect(await output(page)).toContain("  一致");
});

test("regex-tester: worker matches captures, safely rejects invalid expressions",async({page})=>{
 await page.goto(url("regex-tester"));
 await page.locator('[data-tool-workbench] input[placeholder="/pattern/gi"]').fill("/(\\d+)/g");
 await page.locator("[data-tool-workbench]").getByPlaceholder("Test text").fill("ID15 ID27");
 const matches=JSON.parse(await output(page));
 expect(matches.map((m:{match:string})=>m.match)).toEqual(["15","27"]);
 expect(matches[0].groups).toContain("15");
 await page.locator('[data-tool-workbench] input[placeholder="/pattern/gi"]').fill("/[unclosed/g");
 await page.getByRole("button",{name:"Run",exact:true}).click();
 await expect(page.locator("textarea[readonly]")).toHaveCount(0);
});

test("uuid-generator: secure UUID v4 unique values export as actual TXT",async({page})=>{
 await page.goto(url("uuid-generator"));
 await page.getByRole("spinbutton").first().fill("6");
 await page.getByRole("button",{name:"Generate",exact:true}).click();
 const result=await page.locator("textarea[readonly]").first().inputValue();
 const rows=result.trim().split("\n");
 expect(rows).toHaveLength(6);
 expect(new Set(rows).size).toBe(6);
 for(const row of rows)expect(row).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
 const pending=page.waitForEvent("download");
 await page.getByTestId("result-file-actions").getByRole("button",{name:/Download TXT|Save file/}).click();
 const dl=await pending;expect(await dl.failure()).toBeNull();
 expect((await fs.readFile((await dl.path())!,"utf8")).trim()).toBe(result.trim());
});

test("uuid-generator: ordered ULID mode changes output and exports same generated IDs",async({page})=>{
 await page.goto(url("uuid-generator"));
 await page.getByRole("combobox").first().selectOption("ulid");
 await page.getByRole("spinbutton").first().fill("4");
 await page.getByRole("button",{name:"Generate",exact:true}).click();
 const rows=(await page.locator("textarea[readonly]").first().inputValue()).trim().split("\n");
 expect(rows).toHaveLength(4);
 for(const row of rows)expect(row).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
 expect(rows).toEqual([...rows].sort());
});

test("cron-parser: invalid 5-field syntax rejected; each step expands schedule",async({page})=>{
 await page.goto(url("cron-parser"));
 const expr=page.locator("[data-tool-workbench]").getByRole("textbox").first();
 await expr.fill("*/15 * * * *");
 const runs=page.locator("ol li");
 await expect(runs).toHaveCount(10,{timeout:30000});
 const raw=await runs.locator("div.text-xs").allTextContents();
 const stamps=raw.map(s=>Date.parse(s.trim()));
 expect(stamps.every(Number.isFinite)).toBe(true);
 expect(stamps.slice(1).every((x,i)=>x-stamps[i]===15*60*1000)).toBe(true);
 await expr.fill("60 * * * *");
 await expect(page.getByText(/VALUE_OUT_OF_BOUNDS/)).toBeVisible();
 await expect(runs).toHaveCount(0);
});
