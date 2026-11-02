import {test,expect} from "./export-test";

const LANGUAGES=[
 ["zh","卡路里识别"],
 ["en","Calorie Recognition"],
 ["ja","カロリー認識"],
 ["ko","칼로리 인식"],
 ["fr","Reconnaissance des calories"],
 ["de","Kalorienerkennung"],
 ["es","Reconocimiento de calorías"],
 ["pt","Reconhecimento de calorias"],
 ["ar","التعرف على السعرات الحرارية"]
] as const;
for(const [lang,label] of LANGUAGES){
 test(`food-calorie: ${lang} card, detail heading and page metadata use the same concise name`,async({page})=>{
  await page.goto(`/tools/food-calorie?lang=${lang}`);
  await expect(page.locator("main h1").first()).toHaveText(label,{timeout:20000});
  await expect(page).toHaveTitle(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  await expect(page.locator("main")).toHaveAttribute("dir",lang==="ar"?"rtl":"ltr");
  await page.goto(`/tools?lang=${lang}&q=food-calorie`);
  const cards=page.locator("a.lx11-tool-card");
  await expect(cards).toHaveCount(1,{timeout:30000});
  await expect(cards.first().locator("h3")).toHaveText(label);
  await expect(cards.first()).toHaveAttribute("href","/tools/food-calorie");
 });
}
test("calorie recognition: historical Chinese search phrase still locates a single canonical tool",async({page})=>{
 await page.goto("/tools?lang=zh&q="+encodeURIComponent("食物卡路里分析"));
 const cards=page.locator("a.lx11-tool-card");
 await expect(cards).toHaveCount(1,{timeout:30000});
 await expect(cards.first().locator("h3")).toHaveText("卡路里识别");
});

test("tool catalog: exactly 121 unique links; no duplicate HEIC, PDF compression or images-to-PDF cards",async({page})=>{
 await page.goto("/tools?lang=zh");
 const cards=page.locator("a.lx11-tool-card");
 await expect(cards).toHaveCount(121,{timeout:30000});
 const hrefs=await cards.evaluateAll(xs=>xs.map(x=>(x as HTMLAnchorElement).getAttribute("href")||""));
 expect(new Set(hrefs).size).toBe(hrefs.length);
 for(const old of ["heic-local","compress-pdf","image-to-pdf-pro"])expect(hrefs).not.toContain("/tools/"+old);
 for(const current of ["heic-to-jpg","pdf-compress","image-to-pdf","food-calorie"])expect(hrefs.filter(x=>x==="/tools/"+current)).toHaveLength(1);
});

const ALIASES=[
 ["image-to-pdf-pro","image-to-pdf"],
 ["heic-local","heic-to-jpg"],
 ["compress-pdf","pdf-compress"]
] as const;
for(const [legacy,canonical] of ALIASES){
 test(`legacy alias ${legacy} redirects to one canonical ${canonical} and preserves UI language`,async({page})=>{
  await page.goto(`/tools/${legacy}?lang=ja`);
  await expect(page).toHaveURL(new RegExp(`/tools/${canonical}\\?lang=ja$`));
  await expect(page.locator("main h1").first()).toBeVisible({timeout:30000});
 });
}
