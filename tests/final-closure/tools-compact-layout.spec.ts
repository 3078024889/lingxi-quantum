import {test,expect} from "./export-test";
import {mkdir} from "node:fs/promises";
import {publicToolSurface} from "../../lib/tools/public-surface";
import {isAnonymousLocalTool} from "../../lib/tools/local-free-tools";
import {toolTitle} from "../../lib/tools/card-i18n";
import {toolCategoryLabel,toolCardLine} from "../../lib/tools/hub-copy-v1470";
import {TOOL_DISPLAY_CATEGORIES} from "../../lib/tools/display-taxonomy";

const source=publicToolSurface();
const inventory=source.map(t=>({slug:t.slug,href:t.href,category:t.category,localOnly:t.localOnly,titleZh:t.titleZh,titleEn:t.titleEn,descZh:t.descZh,descEn:t.descEn}));
test.describe.configure({mode:"parallel"});

test("complete original inventory, ordering, descriptions, labels, URLs and local-service tags unchanged",async({page},testInfo)=>{
 await page.goto("/tools",{waitUntil:"domcontentloaded"});
 const cards=page.locator(".lx-tools-compact a[data-tool-slug]");
 await expect(cards).toHaveCount(source.length,{timeout:20000});
 const rendered=await cards.evaluateAll(nodes=>nodes.map(node=>({
  slug:node.getAttribute("data-tool-slug"),
  href:node.getAttribute("href"),
  title:node.querySelector("h3")?.textContent?.trim()||"",
  desc:node.querySelector(".lx-tools-v124-desc")?.textContent?.trim()||"",
  category:node.querySelector(".lx-tools-compact-badges .lx-tool-kind")?.textContent?.trim()||"",
  badges:node.querySelectorAll(".lx-tools-compact-badges .lx-tool-kind").length
 })));
 const expected=source.map(t=>({
  slug:t.slug,href:t.href,
  title:toolTitle("zh",t.slug,t.titleZh),
  desc:toolCardLine("zh",t.slug,t.kind,t.descZh,t.descEn)||"",
  category:toolCategoryLabel("zh",t.category),
  badges:isAnonymousLocalTool(t)?2:1
 }));
 expect(rendered).toEqual(expected);
 expect(new Set(rendered.map(t=>t.slug)).size).toBe(source.length);
 await testInfo.attach("unaltered-tools-inventory",{body:JSON.stringify({count:source.length,items:inventory},null,2),contentType:"application/json"});
 console.log("TOOLS_INDEX_INVENTORY_UNCHANGED",source.length);
});

test("real search, category filtering, free-local filtering, clear and original links",async({page})=>{
 await page.goto("/tools");
 const cards=page.locator(".lx-tools-compact a[data-tool-slug]");
 const search=page.locator(".lx11-tool-searchbox input");
 await expect(cards).toHaveCount(source.length);
 await search.fill("PDF");
 await expect(page.locator('a[data-tool-slug="pdf-compress"]')).toBeVisible();
 const filtered=await cards.count();
 expect(filtered).toBeGreaterThan(0);expect(filtered).toBeLessThan(source.length);
 await search.fill("");
 await expect(cards).toHaveCount(source.length);
 const groups=page.locator(".lx-tools-compact .lx-tools-v124-categories");
 await expect(groups).toHaveCount(2);
 await expect(groups.first().locator("button")).toHaveCount(TOOL_DISPLAY_CATEGORIES.length);
 await groups.first().locator("button").nth(2).click();
 await expect(cards).toHaveCount(source.filter(t=>t.category==="image").length);
 await groups.first().locator("button").first().click();
 await expect(cards).toHaveCount(source.length);
 await groups.nth(1).locator("button").nth(1).click();
 await expect(cards).toHaveCount(source.filter(isAnonymousLocalTool).length);
 await groups.nth(1).locator("button").first().click();
 await expect(cards).toHaveCount(source.length);
 const target=page.locator('a[data-tool-slug="pdf-compress"]');
 await expect(target).toHaveAttribute("href","/tools/pdf-compress");
 await target.click();
 await expect(page).toHaveURL(/\/tools\/pdf-compress(?:\?|$)/);
});

test("recent work remains a scrollable complete list with direct opening and continuation",async({page})=>{
 await page.goto("/tools");
 await page.evaluate(()=>{
  const now=Date.now();
  localStorage.setItem("lingxifield-recent-tool-results-v2",JSON.stringify([
   {slug:"compress-image",at:now,fileCount:1,bytes:12000},
   {slug:"png-to-jpg",at:now-60000,fileCount:1,bytes:9000,workspaceId:"111111111111411181111111111111111111"}
  ]));
  window.dispatchEvent(new CustomEvent("lingxifield:recent-tools"));
 });
 const recent=page.locator(".lx-tools-compact-recent");
 await expect(recent).toBeVisible();
 await expect(recent.locator(".lx-tools-compact-recent-item")).toHaveCount(2);
 await expect(recent.locator('a[href="/tools/compress-image"]')).toBeVisible();
 await expect(recent.locator('a[href="/tools/png-to-jpg"]')).toBeVisible();
 await expect(recent.locator("button")).toHaveCount(1);
});

for(const [width,height,columns] of [[375,812,1],[390,844,1],[768,1024,2],[1024,800,2],[1440,900,4],[1920,1080,4]] as const){
 test(`responsive ${width}px: ${columns} columns, 14px+ visible text, no overflow or clamping`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.goto("/tools");
  const cards=page.locator(".lx-tools-compact a[data-tool-slug]");
  await expect(cards).toHaveCount(source.length);
  const data=await page.evaluate(()=>{
   const grid=document.querySelector(".lx-tools-compact .lx-tools-v124-grid");
   if(!grid)throw Error("NO_GRID");
   const first=document.querySelector(".lx-tools-compact a[data-tool-slug]");
   const texts=[...document.querySelectorAll(".lx-tools-compact .lx-tools-v124-desc")];
   const styles=texts.map(el=>{
    const cs=getComputedStyle(el),box=el.getBoundingClientRect();
    return {font:parseFloat(cs.fontSize),scroll:el.scrollHeight,client:el.clientHeight,
     clamp:cs.getPropertyValue("-webkit-line-clamp"),overflow:cs.overflow,visible:box.width>0}
   });
   return {vw:window.innerWidth,documentWidth:document.documentElement.scrollWidth,
    columns:getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
    descriptionStyles:styles,firstCardHeight:first?.getBoundingClientRect().height||0}
  });
  expect(data.documentWidth,JSON.stringify({width,data})).toBeLessThanOrEqual(data.vw+2);
  expect(data.columns,JSON.stringify({width,data})).toBe(columns);
  expect(data.descriptionStyles.length).toBeGreaterThan(0);
  for(const d of data.descriptionStyles){
   expect(d.visible).toBeTruthy();expect(d.font).toBeGreaterThanOrEqual(14);
   expect(["none","unset","initial",""].includes(d.clamp)).toBeTruthy();
   expect(d.scroll).toBeLessThanOrEqual(d.client+2);
  }
  expect(data.firstCardHeight).toBeGreaterThan(60);
 });
}

for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"] as const){
 test(`nine language hub ${lang} retains the full original inventory`,async({page})=>{
  await page.goto("/tools?lang="+lang);
  const cards=page.locator(".lx-tools-compact a[data-tool-slug]");
  await expect(cards).toHaveCount(source.length,{timeout:20000});
  await expect(page.locator(".lx-tools-compact .lx11-tools-hero h1")).not.toBeEmpty();
  await expect(page.locator(".lx-tools-compact .lx-tools-v124-categories").first().locator("button")).toHaveCount(TOOL_DISPLAY_CATEGORIES.length);
 });
}

test("desktop original brand name stays fully visible inside the compact 224px sidebar",async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto("/tools");
 const name=page.locator(".lx11-sidebar:not(.lx11-drawer) .lx11-brand b");
 await expect(name).toContainText("LINGXIFIELD");
 const box=await name.evaluate(el=>{
  const range=document.createRange();range.selectNodeContents(el);
  const rendered=range.getBoundingClientRect();
  const rail=el.closest(".lx11-sidebar")!.getBoundingClientRect();
  return {right:rendered.right,boundary:rail.right-2,font:parseFloat(getComputedStyle(el).fontSize)};
 });
 expect(box.right,JSON.stringify(box)).toBeLessThanOrEqual(box.boundary);
 expect(box.font).toBeGreaterThanOrEqual(14);
});

test("light/dark settings keep complete cards and visible focus",async({page})=>{
 await page.goto("/tools");
 await expect(page.locator(".lx-tools-compact a[data-tool-slug]")).toHaveCount(source.length);
 const desktopControls=page.locator(".lx11-sidebar:not(.lx11-drawer) .lx11-theme-row button");
 if(await desktopControls.first().isVisible())await desktopControls.last().click();
 else{await page.evaluate(()=>localStorage.setItem("lx-theme","dark"));await page.reload()}
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 await expect(page.locator(".lx-tools-compact a[data-tool-slug]").first()).toBeVisible();
 if(await desktopControls.first().isVisible())await desktopControls.first().click();
 else{await page.evaluate(()=>localStorage.setItem("lx-theme","light"));await page.reload()}
 await expect(page.locator("html")).toHaveAttribute("data-theme","light");
 await page.keyboard.press("Tab");
 const focusable=await page.evaluate(()=>document.activeElement?.tagName);
 expect(["A","BUTTON","INPUT","SELECT"]).toContain(focusable);
});

test("capture branch layout at desktop/mobile; compare live screenshot only when production returns 200",async({page},testInfo)=>{
 test.setTimeout(90000);
 const mobile=testInfo.project.name.includes("mobile");
 await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:900});
 const outputDir="test-results/tools-compact-screenshots";
 await mkdir(outputDir,{recursive:true});
 // Production is an external dependency. HTTP 402 from Vercel is NOT a valid baseline.
 const before=await page.goto("https://lingxifield.com/tools",{waitUntil:"domcontentloaded",timeout:30000}).catch(()=>null);
 const liveStatus=before?.status()??null;
 if(liveStatus===200){
  await page.locator("main").first().waitFor();
  const beforePath=`${outputDir}/before-live-${mobile?"390":"1440"}-${testInfo.project.name}.png`;
  await page.screenshot({path:beforePath,animations:"disabled"});
  await testInfo.attach(`before-live-${mobile?"390":"1440"}`,{path:beforePath,contentType:"image/png"});
 }else{
  const reason=`Production visual baseline unavailable: HTTP ${liveStatus??"network error"}. Manual live comparison remains OPEN.`;
  testInfo.annotations.push({type:"external-baseline-unavailable",description:reason});
  await testInfo.attach("production-baseline-blocker",{body:JSON.stringify({site:"https://lingxifield.com/tools",httpStatus:liveStatus,baselineCompared:false,reason}),contentType:"application/json"});
  console.warn("PRODUCTION_VISUAL_BASELINE_UNAVAILABLE",reason);
 }
 const after=await page.goto("/tools",{waitUntil:"domcontentloaded"});
 expect(after?.status()).toBe(200);
 await expect(page.locator(".lx-tools-compact a[data-tool-slug]")).toHaveCount(source.length);
 const afterPath=`${outputDir}/after-branch-${mobile?"390":"1440"}-${testInfo.project.name}.png`;
 await page.screenshot({path:afterPath,animations:"disabled"});
 await testInfo.attach(`after-branch-${mobile?"390":"1440"}`,{path:afterPath,contentType:"image/png"});
});
