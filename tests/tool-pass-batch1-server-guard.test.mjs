import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
for(const {path,slug,sideEffect} of [
 {path:'app/api/tools/document-translate/route.ts',slug:'document-translate',sideEffect:'await resilientText('},
 {path:'app/api/tools/website-diagnose/route.ts',slug:'website-diagnose',sideEffect:'const [a, aaaa, mx, tlsInfo, http]'},
 {path:'app/api/tools/media-import/route.ts',slug:'media-import',sideEffect:'const found = await fetchMediaOrResolveShare('},
 {path:'app/api/tools/document/normalize/route.ts',slug:'office-conversion',sideEffect:'await convertDocumentToPdf(file)'},
]){
 test(slug+' requires unique owner-bound execution receipt before remote processing',()=>{
  const source=read(path),post=source.slice(source.indexOf('export async function POST'));
  assert.match(post,/toolPassBackendReady\(\)/);
  assert.match(post,/redeemToolStart\(\{/);
  assert.ok(post.includes('toolSlug:'+JSON.stringify(slug))||post.includes("toolSlug:'"+slug+"'"));
  assert.match(post,/receipt\.alreadyRedeemed/);
  assert.match(post,/TOOL_OPERATION_ALREADY_STARTED/);
  assert.ok(post.indexOf('await redeemToolStart(')>=0&&post.indexOf('await redeemToolStart(')<post.indexOf(sideEffect),'receipt must precede paid/remote work');
 });
}
