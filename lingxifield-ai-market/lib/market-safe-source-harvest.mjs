/** Low-footprint, bounded read-only vendor document probe. No bypass or approval writes.
 * Design: domain-pinned request queue + robots rules + source snapshots, adopting
 * mature Crawlee/Scrapy patterns without bringing a heavy browser to 2GB hosting.
 */
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {createHash} from 'node:crypto';
export function allowedOfficialUrl(value,hosts){
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return null;
  if(!Array.isArray(hosts)||!hosts.length||hosts.some(h=>!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(h)))return null;
  if(!hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))return null;
  if(isIP(u.hostname))return null;
  return u;
 }catch{return null}
}
export function publicIp(address){
 const normalized=String(address).toLowerCase();
 if(isIP(normalized)===4){
  const [a,b]=normalized.split('.').map(Number);
  return !(a===0||a===10||a===127||a>=224||a===169&&b===254||
   a===172&&b>=16&&b<=31||a===192&&b===168||
   a===100&&b>=64&&b<=127||a===198&&b>=18&&b<=19||
   a===192&&b===0||a===192&&b===0&&false);
 }
 if(isIP(normalized)===6){
  return !(normalized==='::'||normalized==='::1'||normalized.startsWith('fc')||
   normalized.startsWith('fd')||normalized.startsWith('fe8')||
   normalized.startsWith('fe9')||normalized.startsWith('fea')||
   normalized.startsWith('feb')||normalized.startsWith('::ffff:'));
 }
 return false;
}
/** RFC 9309 basic user-agent group controls (strict on unavailable/ambiguous policy). */
export function robotsPermits(content,path,agent='LingxiSIAIResearchBot'){
 const sections=[],lines=String(content).replace(/\r/g,'').split('\n');
 let agents=[],rules=[],hadRules=false;
 const flush=()=>{if(agents.length)sections.push({agents:[...agents],rules:[...rules]});agents=[];rules=[];hadRules=false};
 for(const raw of lines){
  const clean=raw.split('#')[0].trim(),m=clean.match(/^([\w-]+):\s*(.*)$/);
  if(!m)continue;
  const key=m[1].toLowerCase(),v=m[2].trim();
  if(key==='user-agent'){if(hadRules)flush();agents.push(v.toLowerCase());continue}
  if(key==='allow'||key==='disallow'){hadRules=true;rules.push({type:key,path:v})}
 }
 flush();
 const a=agent.toLowerCase();
 const matched=sections.filter(s=>s.agents.includes(a));
 const sets=matched.length?matched:sections.filter(s=>s.agents.includes('*'));
 let matching=[];
 for(const section of sets)for(const rule of section.rules){
  if(!rule.path)continue;
  const prefix=rule.path.split('*')[0].replace(/\$$/,'');
  if(path.startsWith(prefix))matching.push({length:prefix.length,type:rule.type});
 }
 matching.sort((a,b)=>b.length-a.length||(a.type==='allow'?-1:1));
 return matching.length?matching[0].type==='allow':true;
}
const decode=s=>String(s||'').replace(/&(?:amp|lt|gt|quot|apos|nbsp|#(\d+));/g,(m,number)=>{
 if(number)return String.fromCodePoint(Math.min(Number(number),0x10ffff));
 return {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[m]||m;
});
export function extractOfficialText(html,terms=[]){
 const title=decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').trim().slice(0,180);
 const clean=decode(String(html).replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
  .replace(/<\/(?:p|h[1-6]|div|tr|li)>/gi,'\n').replace(/<[^>]+>/g,' '));
 const plain=clean.replace(/[ \t]+/g,' ').replace(/\n[\s\n]+/g,'\n').trim().slice(0,35000);
 const tokens=terms.map(s=>s.toLowerCase()).filter(s=>s.length>2).slice(0,8);
 const needles=plain.toLowerCase(),hits=[];
 for(const term of tokens){const i=needles.indexOf(term);if(i>=0)hits.push({term,excerpt:plain.slice(Math.max(0,i-140),Math.min(plain.length,i+340))})}
 return {title,bodyPreview:plain.slice(0,650),hits};
}
async function readBounded(response,maxBytes){
 const contentLength=Number(response.headers?.get?.('content-length')||0);
 if(contentLength>maxBytes)throw Error('SOURCE_PAGE_TOO_LARGE');
 const reader=response.body?.getReader?.();
 if(!reader)throw Error('SOURCE_NOT_STREAMED');
 const parts=[];let total=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;
  if(total>maxBytes)throw Error('SOURCE_PAGE_TOO_LARGE');parts.push(value);
 }}finally{await reader.cancel().catch(()=>{})}
 const all=new Uint8Array(total);let offset=0;
 for(const part of parts){all.set(part,offset);offset+=part.byteLength}
 return new TextDecoder('utf-8',{fatal:false}).decode(all);
}
export async function snapshotOfficialPage({url,officialHosts,terms=[],fetchFn=fetch,dnsLookup=lookup,timeoutMs=10000}){
 const u=allowedOfficialUrl(url,officialHosts);
 if(!u)throw Error('SOURCE_URL_NOT_PINNED');
 const addresses=await dnsLookup(u.hostname,{all:true});
 if(!addresses.length||addresses.some(x=>!publicIp(x.address)))throw Error('SOURCE_PRIVATE_IP_BLOCKED');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 const get=async target=>fetchFn(target,{redirect:'manual',headers:{'user-agent':'LingxiSIAIResearchBot/1.0 (source-review; no login)'},
  signal:controller.signal});
 try{
  const robots=await get(u.origin+'/robots.txt');
  if(robots.status!==404){
   if(!robots.ok)throw Error('ROBOTS_UNAVAILABLE');
   const txt=await readBounded(robots,120000);
   if(!robotsPermits(txt,u.pathname+u.search))throw Error('ROBOTS_DISALLOWS');
  }
  const response=await get(u.href);
  if(!response.ok||response.status>=300)throw Error('SOURCE_FETCH_HTTP_'+response.status);
  const type=(response.headers?.get?.('content-type')||'').toLowerCase();
  if(!/text\/html|text\/plain/.test(type))return {url:u.href,status:'unsupported_content_type',contentType:type};
  const html=await readBounded(response,260000),details=extractOfficialText(html,terms);
  return {url:u.href,status:'snapshot_only',fetchedAt:new Date().toISOString(),
   sha256:createHash('sha256').update(html).digest('hex'),sizeBytes:Buffer.byteLength(html),
   contentType:type,...details,sourceVerified:false,readyToPublish:false};
 }finally{clearTimeout(timer)}
}
