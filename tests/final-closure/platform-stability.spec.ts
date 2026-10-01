import {test,expect,Page} from "playwright/test";
const LANGS=[
 ["zh","zh-CN","ltr"],["en","en","ltr"],["ja","ja","ltr"],["ko","ko","ltr"],
 ["fr","fr","ltr"],["de","de","ltr"],["es","es","ltr"],["pt","pt","ltr"],["ar","ar","rtl"]
] as const;

async function clean(page:Page){
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.evaluate(()=>localStorage.removeItem("lx-lang"));
 await page.reload({waitUntil:"domcontentloaded"});
}
async function selector(page:Page){
 const desktop=page.locator("aside.lx11-sidebar:not(.lx11-drawer) select.lx11-lang-select").first();
 if(await desktop.isVisible().catch(()=>false))return desktop;
 await page.locator(".lx11-mobile-account").first().click();
 const menu=page.locator(".lx11-account-menu-mobile");
 await expect(menu).toBeVisible();
 await menu.locator(".lx11-account-menu-links button").first().click();
 const drawer=page.locator("aside.lx11-drawer.is-open");
 await expect(drawer).toBeVisible();
 const select=drawer.locator("select.lx11-lang-select").first();
 await expect(select).toBeVisible();
 return select;
}

test("language switching remains visible, persistent and ad-network silent",async({page})=>{
 const ad:string[]=[];
 page.on("request",r=>{if(/googlesyndication|doubleclick|googleadservices/i.test(r.url()))ad.push(r.url())});
 await clean(page);
 let select=await selector(page);
 await select.selectOption("en");
 await expect(page.locator("html")).toHaveAttribute("data-lang","en");
 expect(await page.evaluate(()=>localStorage.getItem("lx-lang"))).toBe("en");
 await page.reload({waitUntil:"domcontentloaded"});
 await expect(page.locator("html")).toHaveAttribute("data-lang","en");
 await expect(page.locator("body")).toBeVisible();
 expect(ad).toEqual([]);
});

test("all nine languages remain visible through the real UI",async({page})=>{
 await clean(page);
 const select=await selector(page);
 for(const [value,lang,dir] of LANGS){
  await select.selectOption(value);
  await expect(page.locator("html")).toHaveAttribute("data-lang",value);
  await expect(page.locator("html")).toHaveAttribute("lang",lang);
  await expect(page.locator("html")).toHaveAttribute("dir",dir);
  await expect(page.locator("body")).toBeVisible();
 }
});
