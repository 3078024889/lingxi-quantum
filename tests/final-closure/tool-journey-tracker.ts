import type {BrowserContext,TestInfo} from 'playwright/test';
import fs from 'node:fs/promises';

// Optional evidence collection. It observes actual DOM interactions and saves
// downloaded files; it does not click controls or replace tool implementations.
export async function trackToolJourney(context:BrowserContext,info:TestInfo){
 const events:unknown[]=[],downloads:Promise<unknown>[]=[],errors:unknown[]=[];
 await context.exposeBinding('__lingxiRecordJourney',({page},entry)=>{events.push({url:page.url(),...entry})});
 await context.addInitScript(()=>{
  const observed=new Set<string>();
  const inScope=(element:Element)=>Boolean(element.closest('main,dialog,[data-testid^="tool-share"]'));
  const controls=()=>Array.from(document.querySelectorAll('main button,main input,main select,main textarea,main summary,dialog button,dialog input,dialog select,button[data-testid^="tool-share"]')).map((element,index)=>{
   const e=element as HTMLInputElement;
   const label=(e.getAttribute('aria-label')||e.getAttribute('title')||(e.tagName==='INPUT'?e.labels?.[0]?.textContent:'')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,180);
   return{index,tag:e.tagName,type:e.getAttribute('type'),label,testId:e.getAttribute('data-testid'),disabled:e.disabled||false,visible:Boolean(e.getClientRects().length),options:e.tagName==='SELECT'?Array.from((e as unknown as HTMLSelectElement).options).map(o=>({value:o.value,label:o.text,selected:o.selected})):undefined};
  });
  const record=(entry:unknown)=>void (window as any).__lingxiRecordJourney({at:Date.now(),...entry as object}).catch(()=>{});
  const snapshot=()=>{const list=controls(),key=JSON.stringify(list);if(!observed.has(key)){observed.add(key);record({kind:'observed-controls',controls:list})}};
  document.addEventListener('click',event=>{
   const target=(event.target as Element)?.closest('button,input,select,summary,a');if(!target||!inScope(target))return;
   const el=target as HTMLInputElement;
   record({kind:'click',trusted:event.isTrusted,tag:el.tagName,type:el.getAttribute('type'),testId:el.getAttribute('data-testid'),label:(el.getAttribute('aria-label')||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,180),controlsBefore:controls()});
   setTimeout(snapshot,0);
  },true);
  document.addEventListener('change',event=>{const e=event.target as HTMLInputElement;if(!inScope(e))return;record({kind:'change',trusted:event.isTrusted,tag:e.tagName,type:e.type,label:e.getAttribute('aria-label')||e.labels?.[0]?.textContent||'',value:e.type==='password'?'[redacted]':e.type==='file'?Array.from(e.files||[]).map(f=>({name:f.name,type:f.type,size:f.size})):e.tagName==='SELECT'||['checkbox','radio','number','range'].includes(e.type)?e.value:undefined});setTimeout(snapshot,0)},true);
  let scheduled=false;const start=()=>{snapshot();new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;snapshot()},100)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','hidden','open','checked']})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 });
 context.on('page',page=>{
  page.on('pageerror',error=>errors.push({url:page.url(),message:error.message}));
  page.on('download',download=>{const number=downloads.length+1;downloads.push((async()=>{const name=download.suggestedFilename().replace(/[^\p{L}\p{N}_.-]/gu,'_'),target=info.outputPath(`journey-download-${number}-${name}`);await download.saveAs(target);return{suggestedFilename:download.suggestedFilename(),path:target,failure:await download.failure()}})())});
 });
 return async()=>{
  const saved=await Promise.allSettled(downloads);
  for(const [index,page]of context.pages().entries())if(!page.isClosed())await page.screenshot({path:info.outputPath(`journey-final-${index}.png`),fullPage:true,timeout:10000}).catch(()=>{});
  const artifact={test:info.titlePath,project:info.project.name,expectedStatus:info.expectedStatus,status:info.status,events,downloads:saved,errors,limits:'An observed control is not an executed control. A click is not proof of a correct result. Provider/payment/share isolation must still be read from the test. This log preserves unresolved controls for follow-up.'};
  await fs.writeFile(info.outputPath('tool-journey.json'),JSON.stringify(artifact,null,2));
  await info.attach('tool-journey',{path:info.outputPath('tool-journey.json'),contentType:'application/json'});
 };
}
