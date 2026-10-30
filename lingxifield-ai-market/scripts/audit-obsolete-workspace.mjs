#!/usr/bin/env node
/**
 * LINGXIFIELD: safe read-only dependency and obsolete-file audit.
 * Does not delete, rename, move or reset ANY source, evidence, user data or secrets.
 * Run from project directory: node scripts/audit-obsolete-workspace.mjs
 */
import {existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bannedDirs=new Set(['.git','.next','node_modules','.vercel','coverage','dist','build','.turbo','.cache','_scratch']);
const codeExts=new Set(['.js','.jsx','.ts','.tsx','.mjs','.cjs','.mts','.cts']);
const routeRe=/(^app\/(?:.*\/)?(?:page|layout|route|template|loading|error|not-found|global-error|default)\.(?:ts|tsx|js|jsx)$)/;
const importantRe=/(^data\/|^public\/|^supabase\/|^\.env|\.lock$|^package\.json$|^tsconfig\.json$|^next\.config|^README|^docs\/|^tests\/|^scripts\/|^types\/)/;
const oldRe=/(^|\/)(?:old|legacy|deprecated|unused|backup|archive|demo|temp|tmp|staging|copy)(?:[._-]|\/)|\.(?:bak|old|orig)$/i;

function walk(folder,output=[]){
 for(const ent of readdirSync(folder,{withFileTypes:true})){
  if(ent.isSymbolicLink())continue;
  const abs=path.join(folder,ent.name);
  const rel=path.relative(projectRoot,abs).split(path.sep).join('/');
  if(ent.isDirectory()){if(!bannedDirs.has(ent.name))walk(abs,output);continue;}
  if(ent.isFile())output.push(rel);
 }
 return output;
}
function code(source){try{return readFileSync(path.join(projectRoot,source),'utf8');}catch{return '';}}
function resolveRef(owner,relative,existing){
 const base=path.posix.normalize(path.posix.join(path.posix.dirname(owner),relative));
 for(const x of [base,...[...codeExts].map(ext=>base+ext),...[...codeExts].map(ext=>base+'/index'+ext)]){
  if(existing.has(x))return x;
 }
 return null;
}
function dependencies(owner,source,existing){
 const result=new Set();
 // static imports, side-effect imports, require(), and literal dynamic import()
 const patterns=[
  /\b(?:import|export)\s+(?:[\s\S]{0,240}?\s+from\s*)?['"](\.{1,2}\/[^'"]+)['"]/g,
  /\b(?:import|require)\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g
 ];
 for(const re of patterns){
  for(const m of source.matchAll(re)){
   const hit=resolveRef(owner,m[1],existing);
   if(hit)result.add(hit);
  }
 }
 return [...result];
}
function walkReachable(roots,graph){
 const reached=new Set(),stack=[...roots];
 while(stack.length){const current=stack.pop();if(reached.has(current))continue;reached.add(current);
  for(const next of graph.get(current)||[])if(!reached.has(next))stack.push(next);
 }
 return reached;
}
function audit(){
 if(!existsSync(path.join(projectRoot,'package.json')))throw Error('NOT_A_NEXT_PROJECT_ROOT');
 const paths=walk(projectRoot).sort(),known=new Set(paths);
 const codeFiles=paths.filter(x=>codeExts.has(path.posix.extname(x)));
 const graph=new Map(),reverse=new Map();
 for(const p of codeFiles){
  const deps=dependencies(p,code(p),known);graph.set(p,deps);
  for(const dep of deps){if(!reverse.has(dep))reverse.set(dep,[]);reverse.get(dep).push(p);}
 }
 const packageJson=JSON.parse(code('package.json'));
 const packageScripts=Object.values(packageJson.scripts||{}).join(' ');
 // Full app routes and command-line scripts are entry points, and test code is a safety dependency.
 const roots=new Set(codeFiles.filter(p=>routeRe.test(p)||p.startsWith('scripts/')||p.startsWith('tests/')));
 for(const p of codeFiles){
  if(packageScripts.includes(p)||packageScripts.includes(path.posix.basename(p)))roots.add(p);
 }
 const reached=walkReachable(roots,graph);
 const candidates=codeFiles.filter(p=>!reached.has(p)&&!importantRe.test(p))
  .map(p=>({path:p,reason:oldRe.test(p)?'legacy_name_and_no_static_dependents':'no_static_dependents',
    referencedBy:reverse.get(p)||[],status:'REVIEW_NOT_DELETE'}));
 const legacyNames=paths.filter(p=>oldRe.test(p)).map(p=>({
  path:p,referencedBy:reverse.get(p)||[],
  protected:importantRe.test(p)||reached.has(p),
  status:'REVIEW_NOT_DELETE'
 }));
 const generated=['.next','node_modules','.turbo','.cache','coverage','dist'].map(name=>{
  const abs=path.join(projectRoot,name);return {path:name,exists:existsSync(abs),
   bytes:'not_calculated',note:'generated artifact; never remove while a process is using it'};
 });
 return {
  schema:'lingxifield_obsolete_audit_v1',
  projectRoot,createdAt:new Date().toISOString(),deletionPerformed:false,
  scan:{files:paths.length,codeFiles:codeFiles.length,entrypoints:roots.size,reachable:reached.size},
  candidates,legacyNames,generated,
  protectedPaths:['data/**','public/**','supabase/**','docs/**','tests/**','scripts/**','.env*','package*.json','*** evidence and user data ***'],
  rules:['No deletion is performed by this script.',
   'A candidate means static import graph did not find a dependency; dynamic loading, script names and external references require manual review.',
   'Before removing a candidate: git status -> archive its SHA -> inspect external references -> edit in a new branch -> run npm run gate and browser E2E.',
   'Never delete D:\\CQWE, D:\\30780, user data, payments, secrets or the project root.']
 };
}
const report=audit();
const output=path.join(projectRoot,'reports','obsolete-workspace-audit.json');
mkdirSync(path.dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({status:'AUDIT_ONLY',root:report.projectRoot,report:output,
 fileCount:report.scan.files,candidates:report.candidates.length,legacyNames:report.legacyNames.length,
 deleted:0},null,2));
