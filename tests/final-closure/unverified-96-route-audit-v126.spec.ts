import {test,expect} from "./export-test";
import {UNVERIFIED_BASELINE_V126} from "./unverified-baseline-v126";

// One-by-one public route and input-surface audit for the exact 96 missing
// full-E2E baseline tools. A route passing DOES NOT prove tool output quality,
// payment, real providers, document correctness or production availability.
const CASES_PER_TEST=8;
for(let start=0;start<UNVERIFIED_BASELINE_V126.length;start+=CASES_PER_TEST){
 const cases=UNVERIFIED_BASELINE_V126.slice(start,start+CASES_PER_TEST);
 test(`unverified public tool routes ${String(start+1).padStart(2,"0")}-${String(start+cases.length).padStart(2,"0")}: every tool checked individually`,async({page})=>{
  test.setTimeout(240000);
  const failures:string[]=[];
  for(const slug of cases){
   let status:number|null=null,heading="",controls=0,redirected=false,error="";
   try{
    const response=await page.goto(`/tools/${slug}?lang=en`,{waitUntil:"domcontentloaded",timeout:22000});
    status=response?.status()??null;
    redirected=!new URL(page.url()).pathname.endsWith("/tools/"+slug);
    const canonicalAliases:Record<string,string>={"image-to-pdf-pro":"/tools/image-to-pdf","heic-local":"/tools/heic-to-jpg","compress-pdf":"/tools/pdf-compress"};
    const validAlias=redirected&&canonicalAliases[slug]===new URL(page.url()).pathname;
    await expect(page.locator("main h1").first()).toBeVisible({timeout:11000});
    heading=(await page.locator("main h1").first().innerText()).trim();
    controls=await page.locator("main [data-tool-workbench] input, main [data-tool-workbench] textarea, main [data-tool-workbench] select, main [data-tool-workbench] button").count();
    if(status!==200||(redirected&&!validAlias)||!heading)error=`HTTP_${status}_OR_ROUTE_MISMATCH`;
   }catch(cause){error=cause instanceof Error?cause.message.slice(0,200):String(cause).slice(0,200);}
   console.log("V126_ONE_BY_ONE_ROUTE_AUDIT "+JSON.stringify({slug,httpStatus:status,title:heading,workbenchControls:controls,redirected,error:error||null,result:error?"ROUTE_FAILED":redirected?"INTENTIONAL_CANONICAL_ALIAS_NOT_FUNCTION_VERIFIED":"ROUTE_RENDERED_NOT_FUNCTION_VERIFIED"}));
   if(error)failures.push(`${slug}:${error}`);
  }
  expect(failures,"Each public tool must render a real tool page, not an error/404/redirect").toEqual([]);
 });
}
