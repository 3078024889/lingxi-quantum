#!/usr/bin/env node
/* Real browser actions against the fixed, PUBLIC Cloudflare Worker Preview.
   This is strictly a subset check; NOT a substitute for 124-tool full acceptance. */
import {chromium} from "playwright";
import {pathToFileURL} from "node:url";
import {previewOrigin} from "./smoke-emergency-preview.mjs";
const base=previewOrigin("https://com-public-recovery-lingxifield-public-preview-only.3078024889.workers.dev");
function expect(value,message){if(!value)throw Error(message)}
async function visit(page,path){
 const r=await page.goto(base+path,{waitUntil:"domcontentloaded",timeout:40000});
 expect(r?.status()===200,"PAGE_NOT_200:"+path+":"+(r?.status()??"null"));
 await page.waitForLoadState("networkidle",{timeout:14000}).catch(()=>{});
 const title=await page.title();
 expect(title.length>3,"EMPTY_TITLE:"+path);
 console.log("LIVE_PUBLIC_PAGE",path,r.status(),title.slice(0,92));
}
async function run(){
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 let failed=false;
 try{
  const context=await browser.newContext({locale:"zh-CN",acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message.slice(0,200)));
  await visit(page,"/");
  await visit(page,"/siai");
  await visit(page,"/tools");
  await visit(page,"/tools/uuid-generator");
  const id=page.locator("[data-tool-workbench]");
  await id.getByRole("button",{name:/生成|generate/i}).first().click({timeout:20000});
  const data=id.locator("textarea[readonly]").first();
  await data.waitFor({timeout:18000});
  const list=(await data.inputValue()).trim().split(/\r?\n/);
  expect(list.length===10,"UUID_WRONG_ROW_COUNT:"+list.length);
  expect(list.every(value=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)),
    "UUID_V4_INVALID");
  console.log("LIVE_LOCAL_UUID_GENERATION","PASS","10 unique? "+(new Set(list).size===10));
  await visit(page,"/tools/url-parser");
  const parser=page.locator("[data-tool-workbench]");
  await parser.locator("textarea:not([readonly])").first().fill("https://example.com/abc?a=1");
  await parser.getByRole("button",{name:/处理|run/i}).first().click({timeout:20000});
  const out=parser.locator("textarea[readonly]").first();
  await out.waitFor({timeout:15000});
  const result=JSON.parse(await out.inputValue());
  expect(result.hostname==="example.com"&&result.pathname==="/abc","URL_PARSER_BAD_OUTPUT");
  console.log("LIVE_LOCAL_URL_PARSER","PASS");
  // Expand the actual browser-compute sample without hitting paid or private APIs.
  const localCases=[
    {path:"/tools/csv-json",input:"name,age\\nAda,37",assert:(out)=>{
      const rows=JSON.parse(out);
      return Array.isArray(rows)&&rows.length===1&&rows[0].name==="Ada";
    }},
    {path:"/tools/case-converter",input:"hello world",assert:(out)=>out.trim()==="helloWorld"},
    {path:"/tools/number-base-converter",input:"255",assert:(out)=>out.trim().toLowerCase()==="ff"},
    {path:"/tools/xml-formatter",input:"<root><item>ok</item></root>",assert:(out)=>
      out.includes("<root>")&&out.includes("<item>ok</item>")&&out.includes("</root>")},
  ];
  for(const c of localCases){
    await visit(page,c.path);
    const w=page.locator("[data-tool-workbench]");
    await w.locator("textarea:not([readonly])").first().fill(c.input);
    await w.getByRole("button",{name:/处理|run/i}).first().click({timeout:20000});
    const output=w.locator("textarea[readonly]").first();
    await output.waitFor({timeout:18000});
    expect(c.assert(await output.inputValue()),"LIVE_BROWSER_TOOL_OUTPUT_INVALID:"+c.path);
    console.log("LIVE_BROWSER_LOCAL_TOOL_OK",c.path);
  }
  await visit(page,"/tools/text-diff");
  const differ=page.locator("[data-tool-workbench]");
  const inputs=differ.locator("textarea:not([readonly])");
  await inputs.nth(0).fill("alpha\\nbeta");
  await inputs.nth(1).fill("alpha\\ngamma");
  await differ.getByRole("button",{name:/处理|run/i}).first().click({timeout:20000});
  const diffOutput=differ.locator("textarea[readonly]").first();
  await diffOutput.waitFor({timeout:18000});
  const diff=await diffOutput.inputValue();
  expect(diff.includes("- beta")&&diff.includes("+ gamma"),"LIVE_BROWSER_DIFF_OUTPUT_INVALID");
  console.log("LIVE_BROWSER_LOCAL_TOOL_OK","/tools/text-diff");
  console.log("BROWSER_PAGE_ERRORS",JSON.stringify(errors.slice(0,8)));
  console.log("PREVIEW_BROWSER_SAMPLE_OK","3 main pages + 7 real local tools");
  console.log("FULL_124_TOOL_PRODUCTION_ACCEPTANCE_NOT_PERFORMED");
 }catch(e){failed=true;console.error("LIVE_PREVIEW_BROWSER_FAILED",e?.stack||e);}
 finally{await browser.close();}
 process.exitCode=failed?1:0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
 run().catch(e=>{console.error(e);process.exitCode=1;});
