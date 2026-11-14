/** Shared announcement projection for the top bell and full message center.
 * The public announcement Worker is independent of private payment APIs.
 * Never treat a failed private endpoint as a reason to hide public notices.
 */
export type UnifiedNotice={
 id:string;eventKey:string;kind:"announcement"|"payment"|"topup"|"refund"|"withdrawal";
 title:string;body:string;createdAt:string;href?:string|null;read?:boolean;status?:string|null;version?:string;
};
type RawNotice={id?:unknown;eventKey?:unknown;kind?:unknown;title?:unknown;body?:unknown;createdAt?:unknown;href?:unknown;read?:unknown;status?:unknown};
type PublicRow={id?:unknown;titleZh?:unknown;titleEn?:unknown;bodyZh?:unknown;bodyEn?:unknown;publishedAt?:unknown;platform?:unknown};
const limited=(value:unknown,max=3500)=>typeof value==="string"?value.slice(0,max):"";
const validDate=(value:unknown)=>typeof value==="string"&&Number.isFinite(Date.parse(value));
export function mergeUnifiedNotices(privateRows:readonly RawNotice[],publicRows:readonly PublicRow[],lang:string,seenAt=""):UnifiedNotice[]{
 const map=new Map<string,UnifiedNotice>();
 for(const row of privateRows){
  if(!validDate(row.createdAt))continue;
  const id=limited(row.eventKey||row.id,190);
  if(!id)continue;
  const kind=limited(row.kind,32);
  if(!["announcement","payment","topup","refund","withdrawal"].includes(kind))continue;
  map.set(id,{id:limited(row.id,190)||id,eventKey:id,kind:kind as UnifiedNotice["kind"],
   title:limited(row.title,200),body:limited(row.body),createdAt:row.createdAt as string,
   href:typeof row.href==="string"&&row.href.startsWith("/")&&!row.href.startsWith("//")?row.href:null,
   read:row.read===true,status:limited(row.status,60)});
 }
 for(const row of publicRows){
  if(!validDate(row.publishedAt)||!limited(row.id,90))continue;
  if(row.platform==="miniapp" || Date.parse(row.publishedAt as string)>Date.now())continue;
  const key="announcement:"+row.id;
  if(map.has(key))continue; // Preserve authenticated server read receipts.
  const zh=lang==="zh",title=limited(zh?row.titleZh:(row.titleEn||row.titleZh),200);
  if(!title)continue;
  map.set(key,{id:key,eventKey:key,kind:"announcement",title,body:limited(zh?row.bodyZh:(row.bodyEn||row.bodyZh)),
    createdAt:row.publishedAt as string,href:"/announcements",
    read:Boolean(seenAt&&validDate(seenAt)&&Date.parse(row.publishedAt as string)<=Date.parse(seenAt))});
 }
 return [...map.values()].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,100);
}
export async function loadUnifiedNotificationFeed(lang:string,base:"/api/notifications"|"/api/account/notifications"){
 const [personal,publicResult]=await Promise.allSettled([
  fetch(base+"?lang="+encodeURIComponent(lang),{cache:"no-store",credentials:"same-origin"}),
  fetch("/api/site-announcements",{cache:"no-store"})
 ]);
 const p=personal.status==="fulfilled"&&personal.value.ok?await personal.value.json().catch(()=>null):null;
 const q=publicResult.status==="fulfilled"&&publicResult.value.ok?await publicResult.value.json().catch(()=>null):null;
 let seenAt="";
 try{seenAt=localStorage.getItem("lx-notifications-seen-at")||""}catch{}
 return {available:Boolean(p||q),items:mergeUnifiedNotices(Array.isArray(p?.items)?p.items:[],Array.isArray(q?.items)?q.items:[],lang,seenAt),
  partial:!p||p.partial===true,readAvailable:p?.readAvailable===true};
}
