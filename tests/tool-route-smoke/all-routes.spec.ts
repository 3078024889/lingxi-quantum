import {test,expect} from "playwright/test";
import recipes from "../../lib/tools/platform/tool-recipes.json";
const expected=124;
if(!Array.isArray(recipes)||recipes.length!==expected)throw Error("TOOL_CATALOG_COUNT_CHANGED_REVIEW_REQUIRED");
const ids=new Set(recipes.map(x=>x.slug));
if(ids.size!==recipes.length)throw Error("TOOL_ROUTE_DUPLICATED_SLUGS");
for(const tool of recipes){
 test(`tool route responds: ${tool.slug}`,async({page},info)=>{
  const errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  const response=await page.goto(`/tools/${encodeURIComponent(tool.slug)}?lang=en`,{waitUntil:"domcontentloaded"});
  expect(response,`No response for ${tool.slug}`).not.toBeNull();
  expect(response!.status(),`HTTP status for ${tool.slug}`).toBeLessThan(400);
  await expect(page.locator("main").first()).toBeVisible({timeout:10000});
  const body=(await page.locator("main").first().innerText()).trim();
  expect(body.length,`Empty tool page ${tool.slug}`).toBeGreaterThan(40);
  const heading=page.locator("h1").first();
  await expect(heading).toBeVisible({timeout:10000});
  expect((await heading.innerText()).trim().length).toBeGreaterThan(1);
  info.annotations.push({type:"contract",description:tool.privacyMode});
  if(errors.length)await info.attach("browser-errors",{body:errors.join("\n"),contentType:"text/plain"});
 });
}
