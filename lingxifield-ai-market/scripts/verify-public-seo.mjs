#!/usr/bin/env node
/**
 * Public SEO acceptance probe, no credentials and no changes to remote site.
 * Usage: node scripts/verify-public-seo.mjs https://your-public-preview.netlify.app
 *        node scripts/verify-public-seo.mjs https://ai.lingxifield.com --indexed
 * Preview default: require crawler noindex until domain ownership is approved.
 */
import {pathToFileURL} from 'node:url';
export const languages=['zh','en','ja','ko','fr','de','es','pt','ar'];
export function analyzeHome(html,locale,{indexed=false,canonicalOrigin=''}={}){
 const issues=[];
 const opening=html.match(/<html\b[^>]*>/i)?.[0]||'';
 const lang=opening.match(/\blang=["']([^"']+)/i)?.[1]||'';
 const dir=opening.match(/\bdir=["']([^"']+)/i)?.[1]||'';
 if(lang!==(locale==='zh'?'zh-CN':locale))issues.push('ROOT_LANG_MISMATCH');
 if(dir!==(locale==='ar'?'rtl':'ltr'))issues.push('ROOT_DIRECTION_MISMATCH');
 const robots=[...html.matchAll(/<meta\s+[^>]*name=["']robots["'][^>]*>/gi)].map(m=>m[0]).join(' ');
 const noindex=/noindex/i.test(robots);
 if(indexed){
  if(noindex)issues.push('NOINDEX_ON_PUBLISHED_PAGE');
  const canonical=html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i)?.[0]||'';
  if(!canonical.includes(canonicalOrigin+'/'+locale+'/ai'))issues.push('CANONICAL_MISSING_OR_WRONG');
  if(!/hreflang=["'](?:en|zh-CN|ar|x-default)/i.test(html))issues.push('HREFLANG_MISSING');
 }else if(!noindex){issues.push('PREVIEW_MUST_BE_NOINDEX')}
 return issues;
}
function cleanOrigin(input){
 const u=new URL(input);
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.search||u.hash||u.pathname!=='/')throw Error('EXPECTED_HTTPS_ORIGIN_ONLY');
 return u.origin;
}
async function fetchPage(origin,path){
 const r=await fetch(origin+path,{headers:{'User-Agent':'LINGXIFIELD-Public-SEO-Acceptance/1.0','Accept':'text/html'},redirect:'follow',signal:AbortSignal.timeout(15000)});
 const contentType=r.headers.get('content-type')||'';
 const text=await r.text();
 return {status:r.status,contentType,text,finalUrl:r.url};
}
export async function verify(origin,{indexed=false}={}){
 const base=cleanOrigin(origin),checks=[];
 for(const locale of languages){
  const path='/'+locale+'/ai';
  try{
   const r=await fetchPage(base,path);
   let issues=[];
   if(r.status!==200)issues.push('HTTP_'+r.status);
   if(!/text\/html/.test(r.contentType))issues.push('NOT_HTML');
   if(r.finalUrl&&new URL(r.finalUrl).origin!==base)issues.push('REDIRECTED_TO_OTHER_HOST');
   if(/text\/html/.test(r.contentType)&&r.status===200)issues.push(...analyzeHome(r.text,locale,{indexed,canonicalOrigin:base}));
   checks.push({path,ok:issues.length===0,issues});
  }catch(e){checks.push({path,ok:false,issues:['NETWORK_'+String(e).slice(0,90)]})}
 }
 for(const path of ['/zh/platform/chatgpt','/en/platform/suno','/ar/platform/luma']){
  try{
   const r=await fetchPage(base,path);
   checks.push({path,ok:r.status===200&&/text\/html/.test(r.contentType),issues:r.status===200?[]:['HTTP_'+r.status]});
  }catch(e){checks.push({path,ok:false,issues:['NETWORK_'+String(e).slice(0,90)]})}
 }
 try{
  const r=await fetchPage(base,'/robots.txt');
  const disallow=/^Disallow:\s*\/\s*$/mi.test(r.text),issues=[];
  if(r.status!==200)issues.push('ROBOTS_HTTP_'+r.status);
  if(indexed&&disallow)issues.push('LIVE_ROBOTS_DISALLOW_ALL');
  if(!indexed&&!disallow)issues.push('PREVIEW_ROBOTS_NOT_BLOCKED');
  checks.push({path:'/robots.txt',ok:issues.length===0,issues});
 }catch(e){checks.push({path:'/robots.txt',ok:false,issues:['NETWORK_'+String(e).slice(0,90)]})}
 if(indexed)try{
  const r=await fetchPage(base,'/sitemap.xml');
  const issues=[];
  if(r.status!==200||!r.text.includes('<urlset'))issues.push('SITEMAP_EMPTY_OR_HTTP_ERROR');
  if(!r.text.includes('/en/platform/chatgpt'))issues.push('SITEMAP_MISSING_PRODUCTS');
  checks.push({path:'/sitemap.xml',ok:issues.length===0,issues});
 }catch(e){checks.push({path:'/sitemap.xml',ok:false,issues:['NETWORK_'+String(e).slice(0,90)]})}
 const failed=checks.filter(c=>!c.ok);
 return {origin:base,indexed,checked:checks.length,passed:checks.length-failed.length,failed:failed.length,checks};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const url=process.argv.find(a=>/^https:\/\//.test(a));
 if(!url){process.stderr.write('Usage: node scripts/verify-public-seo.mjs https://your-site.netlify.app [--indexed]\n');process.exitCode=2;}
 else try{
  const result=await verify(url,{indexed:process.argv.includes('--indexed')});
  console.log(JSON.stringify(result,null,2));if(result.failed)process.exitCode=1;
 }catch(e){console.error(String(e));process.exitCode=2}
}
