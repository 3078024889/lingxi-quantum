import {test,expect} from "@playwright/test";
import {GLOBAL_TOOL_CATALOG} from "../../lib/seo/global-seo";

// Public-route coverage only. Does not imply that a tool's conversion,
// provider, payment or native share flow has passed functional testing.
const tools=GLOBAL_TOOL_CATALOG.map(t=>t.slug);
const groupSize=20;
for(let start=0;start<tools.length;start+=groupSize){
 const group=tools.slice(start,start+groupSize);
 test(`public tool routes ${start+1}-${start+group.length} load without HTTP errors`,async({page})=>{
  test.setTimeout(180000);
  const failed:string[]=[];
  for(const slug of group){
   try{
    const res=await page.goto(`/tools/${slug}?lang=zh`,{waitUntil:"domcontentloaded",timeout:12000});
    const status=res?.status()??0;
    if(status>=400||!status)failed.push(`${slug}:HTTP_${status}`);
    else if(!(await page.locator("main").count()))failed.push(`${slug}:MAIN_MISSING`);
   }catch(e){failed.push(`${slug}:${e instanceof Error?e.message.slice(0,120):String(e)}`)}
  }
  expect(failed,"Every catalog route must be reachable; this is not proof of functional output").toEqual([]);
 });
}
