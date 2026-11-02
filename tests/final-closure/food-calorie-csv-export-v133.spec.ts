import {test,expect} from "./export-test";
import {foodMealCsv,csvCell} from "../../lib/tools/food/meal-export";
import type {MealResult} from "../../lib/tools/food/meal-calculation";
import fs from "node:fs/promises";

const result:MealResult={
 items:[{food_id:12,name_zh:"米饭",name_en:"Rice",grams:150,kcal:195,protein_g:4,carbs_g:42,fat_g:0.3,fiber_g:null,sugar_g:null,sodium_mg:null,source:"=HYPERLINK(\"https://evil.example\",\"click\")"}],
 total:{grams:150,kcal:195,protein_g:4,carbs_g:42,fat_g:0.3,fiber_g:null,sugar_g:null,sodium_mg:null},
 sources:["=HYPERLINK(\"https://evil.example\",\"click\")"]
};

test("nine-language nutrition CSV serialization preserves unknown nutrients, unicode, and neutralizes formulas",()=>{
 expect(csvCell("  =1+1")).toBe('"\'  =1+1"');
 expect(csvCell("+SUM(1,2)")).toBe('"\'+SUM(1,2)"');
 expect(csvCell("@cmd")).toBe('"\'@cmd"');
 expect(csvCell("-42")).toBe('"\'-42"');
 expect(csvCell(-42)).toBe('"-42"');
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"] as const){
  const csv=foodMealCsv(result,lang);
  const lines=csv.trim().split("\r\n");
  expect(lines).toHaveLength(3);
  expect(lines[1]).toContain(lang==="zh"?"米饭":"Rice");
  expect(lines[1]).toContain('"150"');
  expect(lines[1]).toContain('"195"');
  expect(lines[1]).toContain('"'=HYPERLINK(');
  expect(lines[1]).toContain(',"","",');
  expect(lines[2]).toContain('"150"');
 }
});

test("calorie result: after a simulated authorized analysis users download correctly encoded food and nutrition CSV",async({page})=>{
 const food={food_id:12,name_zh:"米饭",name_en:"Rice",source:"USDA test data",per100:{kcal:130,protein_g:2.66,carbs_g:28,fat_g:0.2}};
 let created=0,calculated=0;
 await page.route("**/api/tools/food/search?**",route=>route.fulfill({json:{items:[food]}}));
 await page.route("**/api/tools/food/free-status",route=>route.fulfill({json:{available:true}}));
 await page.route(/\/api\/tools\/food\/analysis(?:\/[^/?]+)?(?:\?.*)?$/,route=>{
  const url=new URL(route.request().url());
  if(route.request().method()==="POST"&&url.pathname==="/api/tools/food/analysis"){
   created++;return route.fulfill({json:{id:"test-food-analysis",quantity:1,mode:"custom",freeEligible:true,completed:false}});
  }
  if(route.request().method()==="POST"){calculated++;return route.fulfill({json:result});}
  return route.fulfill({status:404,json:{error:"NOT_FOUND"}});
 });
 await page.goto("/tools/food-calorie?lang=en");
 await page.getByRole("button",{name:"Enter foods",exact:true}).click();
 const area=page.locator("main");
 await area.getByRole("textbox",{name:"Search foods"}).fill("Rice");
 await area.getByRole("button",{name:"Search foods",exact:true}).click();
 await area.getByRole("button",{name:/Rice.*USDA test data/}).click();
 await area.getByRole("button",{name:"View full analysis",exact:true}).click();
 await area.getByRole("button",{name:/Use today.s free analysis/}).click();
 const exportButton=area.getByRole("button",{name:"Download CSV nutrition record",exact:true});
 await expect(exportButton).toBeVisible({timeout:15000});
 const pending=page.waitForEvent("download");
 await exportButton.click();
 const download=await pending;expect(download.suggestedFilename()).toBe("calorie-recognition.csv");
 expect(await download.failure()).toBeNull();
 const bytes=await fs.readFile((await download.path())!);
 expect(bytes.subarray(0,3).toString("hex")).toBe("efbbbf");
 const csv=bytes.toString("utf8");
 expect(csv).toContain('"Rice","150","195"');
 expect(csv).toContain('"'=HYPERLINK(');
 expect(csv).not.toContain('"0","0","0"');
 expect(created).toBe(1);expect(calculated).toBe(1);
});
