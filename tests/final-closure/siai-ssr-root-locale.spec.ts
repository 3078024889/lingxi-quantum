import {test,expect} from "./export-test";
const locales=[["","zh-CN"],["en","en"],["ja","ja"],["ko","ko"],["fr","fr"],["de","de"],["es","es"],["pt","pt"],["ar","ar"]] as const;
for(const [locale,expectedLanguage] of locales){
 test("SEO response language "+(locale||"zh"),async({request})=>{
  const path=locale?"/"+locale+"/siai":"/siai";
  const response=await request.get(path);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-language"]).toBe(expectedLanguage);
  const html=await response.text();
  expect(html).toContain('rel="canonical" href="https://lingxifield.com'+path+'"');
  expect(html).toContain('FAQPage');
  if(locale==="ar")expect(html).toContain('dir="rtl"');
 });
}
