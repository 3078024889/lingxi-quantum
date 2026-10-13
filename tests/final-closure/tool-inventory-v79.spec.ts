import {test,expect} from 'playwright/test';
import {publicToolSurface} from '../../lib/tools/public-surface';

test('all public tool entries resolve to real HTTP 200 pages',async({request})=>{
 test.setTimeout(180000);
 const tools=publicToolSurface(),failures:string[]=[];
 expect(new Set(tools.map(t=>t.slug)).size).toBe(tools.length);
 for(let start=0;start<tools.length;start+=6){
  await Promise.all(tools.slice(start,start+6).map(async tool=>{
   const r=await request.get(tool.href+'?lang=en');
   if(r.status()!==200)failures.push(tool.slug+':'+r.status());
   else if(!/<title>[^<]+<\/title>/.test(await r.text()))failures.push(tool.slug+':NO_TITLE');
  }));
 }
 expect(failures).toEqual([]);
});
