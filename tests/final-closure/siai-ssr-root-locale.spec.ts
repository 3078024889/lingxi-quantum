import {test,expect} from "./export-test";
const locales=[["","zh-CN","ltr"],["en","en","ltr"],["ja","ja","ltr"],["ko","ko","ltr"],["fr","fr","ltr"],["de","de","ltr"],["es","es","ltr"],["pt","pt","ltr"],["ar","ar","rtl"]] as const;
for(const [locale,expectedLang,expectedDir] of locales){
 test("SSR html locale for "+(locale||"zh"),async({request})=>{
  const path=locale?"/"+locale+"/siai":"/siai";
  const response=await request.get(path);
  expect(response.status()).toBe(200);
  const html=await response.text();
  expect(html.slice(0,600)).toMatch(new RegExp('<html[^>]*lang="'+expectedLang+'"'));
  expect(html.slice(0,600)).toMatch(new RegExp('<html[^>]*dir="'+expectedDir+'"'));
  expect(html).toContain('rel="canonical" href="https://lingxifield.com'+path+'"');
 });
}
