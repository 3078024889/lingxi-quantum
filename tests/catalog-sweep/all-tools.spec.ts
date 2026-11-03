import fs from "node:fs";
import path from "node:path";
import {test,expect} from "playwright/test";

type Recipe={slug:string};
const recipes=JSON.parse(fs.readFileSync(path.join(process.cwd(),"lib/tools/platform/tool-recipes.json"),"utf-8")) as Recipe[];
const slugs=recipes.map(recipe=>recipe.slug).filter(slug=>slug!=="image-to-pdf-pro");
const languages=["en","ja","ko","fr","de","es","pt","ar","zh"];

test.describe("Every public tool route loads in an actual browser",()=>{
 test.describe.configure({mode:"parallel"});
 for(const [index,slug] of slugs.entries()){
  test(slug,async({page},info)=>{
   if(info.project.name==="mobile-chromium"&&index%9!==0)test.skip();
   test.setTimeout(60000);
   const lang=info.project.name==="mobile-chromium"?languages[Math.floor(index/9)%languages.length]:"en";
   const response=await page.goto("/tools/"+encodeURIComponent(slug)+"?lang="+lang,{waitUntil:"domcontentloaded",timeout:40000});
   expect(response,"Tool route has a real HTTP response").not.toBeNull();
   expect(response!.status(),"Tool route is not a 404/500").toBeLessThan(400);
   // Dedicated workflows render a custom main instead of the shared data-tool-workbench shell.
   // Check their actual controls rather than forcing an unrelated wrapper selector.
   const dedicated=new Set(["burn-after-read","food-calorie","temp-mail","ai-image-check","ai-video-audio-check"]);
   const main=page.locator("main").first();
   await expect(main,"A real tool page must render").toBeVisible({timeout:15000});
   const workspace=dedicated.has(slug)?main:page.locator("[data-tool-workbench]").first();
   await expect(workspace,"Tool workspace appears").toBeVisible({timeout:15000});
   if(dedicated.has(slug)){
    await expect(workspace.locator("button,input,textarea,select").first(),"Dedicated workflow must have real controls").toBeVisible({timeout:15000});
   }
   const diagnostics=await page.evaluate(()=>{
    const root=document.querySelector("[data-tool-workbench]")||document.querySelector("main");
    const body=document.body.innerText||"";
    return {rootText:(root?.textContent||"").trim().length,controls:root?.querySelectorAll("input,select,textarea,button,canvas,video,[role=button]").length||0,bodyText:body.length,docLang:document.documentElement.lang,dir:document.documentElement.dir};
   });
   expect(diagnostics.bodyText,"Page must not be blank").toBeGreaterThan(50);
   expect(diagnostics.controls+Number(diagnostics.rootText>30),"A tool needs content or controls").toBeGreaterThan(0);
   if(info.project.name==="mobile-chromium"){
    await expect.poll(()=>page.evaluate(()=>document.documentElement.dir)).toBe(lang==="ar"?"rtl":"ltr");
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(width.scroll,"No major page-wide horizontal overflow on mobile").toBeLessThanOrEqual(width.client+40);
   }
  });
 }
});
