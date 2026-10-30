// Read-only routing audit; no network and no production mutations.
// Physical Next.js pages plus literal catalog hrefs, not a claim of full browser E2E.
import {readFile,readdir,access,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const file=p=>resolve(root,p);
const read=p=>readFile(file(p),'utf8');
const exists=async p=>access(file(p)).then(()=>true,()=>false);
const [advanced,registry]=await Promise.all([read('lib/tools/advanced-catalog.ts'),read('lib/tools/registry.ts')]);
const hrefs=[...advanced.matchAll(/\bhref\s*:\s*['"](\/tools\/[a-z0-9-]+)['"]/g)].map(x=>x[1]);
const counts=new Map();for(const href of hrefs)counts.set(href,(counts.get(href)||0)+1);
const duplicates=[...counts].filter(([,n])=>n>1).map(([href,n])=>({href,count:n}));
const physical=(await readdir(file('app/tools'),{withFileTypes:true})).filter(x=>x.isDirectory()&&!x.name.startsWith('['));
const physicalOut=[];
for(const d of physical){
 const hasPage=await exists('app/tools/'+d.name+'/page.tsx');
 const hasRoute=await exists('app/tools/'+d.name+'/route.ts');
 physicalOut.push({slug:d.name,hasPage,hasRoute});
}
const routeSet=new Set(physicalOut.filter(x=>x.hasPage||x.hasRoute).map(x=>x.slug));
const registered=[...registry.matchAll(/\bslug\s*:\s*['"]([a-z0-9-]+)['"]/g)].map(x=>x[1]);
const mapped=[...registry.matchAll(/\[\s*['"]([a-z0-9-]+)['"]\s*,\s*['"]/g)].map(x=>x[1]);
const slugSet=new Set([...registered,...mapped]);
const dynamicExists=await exists('app/tools/[slug]/page.tsx');
const linkFindings=[...new Set(hrefs)].map(href=>{
 const slug=href.slice('/tools/'.length);
 return {href,resolution:routeSet.has(slug)?'dedicated_route':dynamicExists&&slugSet.has(slug)?'registry_dynamic':'unresolved_in_static_scan'};
});
const dedicated=[...registry.matchAll(/\{[^{}]{0,800}\bslug\s*:\s*['"]([a-z0-9-]+)['"][^{}]{0,800}\bdedicatedRoute\s*:\s*true[^{}]*\}/gs)].map(x=>x[1]);
const dedicatedMissing=[...new Set(dedicated)].filter(slug=>!routeSet.has(slug));
const invalidStatic=physicalOut.filter(x=>!x.hasPage&&!x.hasRoute);
const report={generatedAt:new Date().toISOString(),root:'app/tools',physicalRouteDirectories:physicalOut.length,
 advancedCatalogLinks:hrefs.length,uniqueAdvancedLinks:linkFindings.length,
 dedicatedLinks:linkFindings.filter(x=>x.resolution==='dedicated_route').length,
 registryDynamicLinks:linkFindings.filter(x=>x.resolution==='registry_dynamic').length,
 unresolvedStaticScan:linkFindings.filter(x=>x.resolution==='unresolved_in_static_scan'),
 duplicateAdvancedLinks:duplicates,dedicatedMissing,invalidStatic,dynamicRoutePresent:dynamicExists,
 caveat:'Static audit only; dynamic route registrations, tool execution, uploads, exports, user entitlements and sharing require browser E2E.'};
const json=JSON.stringify(report,null,2)+'\n';
if(process.argv[2]){const out=resolve(process.argv[2]);await mkdir(dirname(out),{recursive:true});await writeFile(out,json);}
console.log(JSON.stringify({routes:report.physicalRouteDirectories,advanced:report.advancedCatalogLinks,unresolved:report.unresolvedStaticScan.length,duplicates:duplicates.length,dedicatedMissing:dedicatedMissing.length,invalidStatic:invalidStatic.length}));
if(duplicates.length||dedicatedMissing.length||invalidStatic.length||!dynamicExists)process.exitCode=2;
