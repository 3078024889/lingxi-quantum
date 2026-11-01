import {test,expect} from "./export-test";
import {GLOBAL_TOOL_CATALOG} from "../../lib/seo/global-seo";
import {publicToolSurface} from "../../lib/tools/public-surface";
import {LINGXIFIELD_PUBLIC_TOOL_REGISTRY} from "../../lib/tools/platform/tool-registry";
import {toolTutorialSteps} from "../../lib/tools/tutorial-copy";
import recipes from "../../lib/tools/platform/tool-recipes.json";
import fixtureMatrix from "../../lib/tools/platform/fixture-matrix.json";

const ids=["ai-image-check","ai-video-audio-check"] as const;
const languages=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;

test("AI media detection is indexed and has real C2PA evidence contracts",()=>{
 const seoIds=GLOBAL_TOOL_CATALOG.map(t=>t.slug),surface=publicToolSurface().map(t=>t.slug);
 const registry=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.map(t=>t.slug),recipeIds=recipes.map(r=>r.slug);
 expect(new Set(seoIds).size).toBe(seoIds.length);
 expect(new Set(registry).size).toBe(registry.length);
 expect(seoIds.length).toBe(124);
 expect(registry.length).toBe(seoIds.length);
 expect(recipeIds.sort()).toEqual([...seoIds].sort());
 expect(fixtureMatrix.classificationCount).toBe(124);
 expect(Object.keys(fixtureMatrix.toolClassifications).sort()).toEqual([...seoIds].sort());
 for(const id of ids){
  expect(seoIds).toContain(id);
  expect(surface).toContain(id);
  const tool=LINGXIFIELD_PUBLIC_TOOL_REGISTRY.find(t=>t.slug===id);
  expect(tool).toMatchObject({mode:"local",privacyMode:"local-first",requiresRealFixture:true,requiresNineLanguage:true});
  const classification=fixtureMatrix.toolClassifications[id];
  expect(classification).toMatchObject({kind:"fixture"});
  const group=fixtureMatrix.fixtureGroups.find(g=>g.id===classification.fixtureGroup);
  expect(group?.covers).toContain(id);
  expect(group?.file).toMatch(/c2pa-official\//);
  for(const lang of languages){
   const steps=toolTutorialSteps(lang,id);
   expect(steps).toHaveLength(3);
   expect(steps.every(step=>step.trim().length>20)).toBeTruthy();
  }
 }
});

for(const id of ids)test(`${id} opens real dedicated detector and nine-language guide`,async({page})=>{
 test.setTimeout(120000);
 for(const lang of languages){
  const response=await page.goto(`/tools/${id}?lang=${lang}`,{waitUntil:"domcontentloaded"});
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("data-lang",lang);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByRole("button",{name:lang==="en"?"Start checking":undefined}).first()).toBeVisible();
  const guide=page.locator("section[aria-label] ol").first();
  await expect(guide).toBeVisible();
  await expect(guide.locator("li")).toHaveCount(3);
 }
});
