import {test,expect,Page} from "playwright/test";

const LANGS=[
 ["zh","zh-CN","ltr"],["en","en","ltr"],["ja","ja","ltr"],["ko","ko","ltr"],
 ["fr","fr","ltr"],["de","de","ltr"],["es","es","ltr"],["pt","pt","ltr"],["ar","ar","rtl"]
] as const;

async function startClean(page:Page){
 await page.goto("/",{waitUntil:"domcontentloaded"});
 await page.evaluate(()=>localStorage.removeItem("lx-lang"));
 await page.reload({waitUntil:"domcontentloaded"});
}

async function languageSelect(page:Page){
 const desktop=page.locator("aside.lx11-sidebar:not(.lx11-drawer) select.lx11-lang-select").first();
 if(await desktop.isVisible().catch(()=>false)) return desktop;

 // Real mobile path: account menu -> site navigation -> drawer -> language select.
 const account=page.locator(".lx11-mobile-account").first();
 await expect(account).toBeVisible();
 await account.click();

 const mobileMenu=page.locator(".lx11-account-menu-mobile");
 await expect(mobileMenu).toBeVisible();

 const navButton=mobileMenu.locator(".lx11-account-menu-links button").first();
 await expect(navButton).toBeVisible();
 await navButton.click();

 const drawer=page.locator("aside.lx11-drawer.is-open");
 await expect(drawer).toBeVisible();
 const select=drawer.locator("select.lx11-lang-select").first();
 await expect(select).toBeVisible();
 return select;
}

test("English switch persists across a real reload and never hides the document",async({page})=>{
 const adRequests:string[]=[];
 page.on("request",r=>{if(/googlesyndication|doubleclick|googleadservices/i.test(r.url()))adRequests.push(r.url())});

 await startClean(page);
 let select=await languageSelect(page);
 await select.selectOption("en");

 const html=page.locator("html");
 await expect(html).toHaveAttribute("data-lang","en");
 await expect(html).toHaveAttribute("lang","en");
 await expect(page.locator("body")).toBeVisible();
 expect(await html.evaluate(el=>getComputedStyle(el).display)).not.toBe("none");
 expect(await page.evaluate(()=>localStorage.getItem("lx-lang"))).toBe("en");

 await page.reload({waitUntil:"domcontentloaded"});
 await expect(page.locator("html")).toHaveAttribute("data-lang","en");
 await expect(page.locator("html")).toHaveAttribute("lang","en");
 await expect(page.locator("body")).toBeVisible();
 expect(await page.locator("html").evaluate(el=>getComputedStyle(el).display)).not.toBe("none");
 expect(await page.evaluate(()=>localStorage.getItem("lx-lang"))).toBe("en");
 expect(adRequests,"E2E must never contact live Google ad endpoints").toEqual([]);
});

test("all nine language switches keep html and body visible through the actual UI",async({page})=>{
 await startClean(page);
 let select=await languageSelect(page);

 for(let i=0;i<LANGS.length;i++){
  const [value,lang,dir]=LANGS[i];
  await select.selectOption(value);
  const html=page.locator("html");
  await expect(html).toHaveAttribute("data-lang",value);
  await expect(html).toHaveAttribute("lang",lang);
  await expect(html).toHaveAttribute("dir",dir);
  await expect(page.locator("body")).toBeVisible();
  expect(await html.evaluate(el=>getComputedStyle(el).display),value).not.toBe("none");
  expect(await page.evaluate(()=>localStorage.getItem("lx-lang")),value).toBe(value);
 }
});
