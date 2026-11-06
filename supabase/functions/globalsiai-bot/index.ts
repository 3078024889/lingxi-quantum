import {buildPost, singaporeDay, singaporeHour, SLOT_HOURS, trackedLink, trackedCNLink, type TelegramSlot} from "./editorial.ts";

/**
 * Global SIAI Telegram worker on the existing Supabase Free project.
 * Independent of Vercel and its Hobby commercial restrictions.
 * Fail-closed until TELEGRAM_BOT_TOKEN is configured in Supabase Edge Secrets.
 */
const GROUP = "@globalsiai";
const SCHEDULER_KEY_SHA256 = "e8b475615cab1a8e5536a773c1f136185094cb3bce8a7b9a66d1b2b020711be6";
const SLOTS:TelegramSlot[]=["discovery","tutorial","comparison","creation","community"];

type TelegramChat={id:number;type:string;username?:string};
type TelegramMessage={
  message_id:number;
  chat:TelegramChat;
  from?:{id:number;is_bot?:boolean};
  text?:string;
  new_chat_members?:Array<{id:number;is_bot?:boolean}>;
};
type TelegramUpdate={update_id:number;message?:TelegramMessage};

function respond(status:number,data:Record<string,unknown>){
 return new Response(JSON.stringify(data),{
  status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},
 });
}
async function sha256(text:string):Promise<string>{
 const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
}
function config(){
 const token=(Deno.env.get("TELEGRAM_BOT_TOKEN")||"").trim();
 const url=(Deno.env.get("SUPABASE_URL")||"").trim();
 const serviceKey=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
 if(!token||!url||!serviceKey)return null;
 if(!/^\d{5,14}:[a-zA-Z0-9_-]{30,}$/.test(token))return null;
 return {token,url,serviceKey};
}
async function telegram(token:string,method:string,payload:Record<string,unknown>):Promise<any>{
 const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{
  method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),
  signal:AbortSignal.timeout(8000),
 });
 if(!r.ok)throw Error(`TELEGRAM_${method}_HTTP_${r.status}`);
 const json=await r.json();
 if(!json.ok)throw Error(`TELEGRAM_${method}_REJECTED`);
 return json.result;
}
async function db(ctx:NonNullable<ReturnType<typeof config>>,table:string,method:string,body?:unknown,filter="",extraHeaders:Record<string,string>={}):Promise<Response>{
 const u=`${ctx.url}/rest/v1/${table}${filter}`;
 return fetch(u,{
  method,headers:{
   apikey:ctx.serviceKey,authorization:`Bearer ${ctx.serviceKey}`,
   "content-type":"application/json",...extraHeaders,
  },
  body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000),
 });
}
async function claim(ctx:NonNullable<ReturnType<typeof config>>,key:string,kind:"daily"|"webhook"):Promise<boolean>{
 const r=await db(ctx,"telegram_community_events","POST",{event_key:key,event_kind:kind,status:"claimed"});
 if(r.status===409)return false;
 if(!r.ok)throw Error(`CLAIM_HTTP_${r.status}`);
 return true;
}
async function status(ctx:NonNullable<ReturnType<typeof config>>,key:string,next:"failed"|"delivered"){
 await db(ctx,"telegram_community_events","PATCH",{status:next},
  `?event_key=eq.${encodeURIComponent(key)}`);
}
function allowed(chat:TelegramChat){
 if(chat.type!=="group" && chat.type!=="supergroup")return false;
 return chat.username?.toLowerCase()==="globalsiai";
}
function spam(text:string){
 const links=text.match(/(?:https?:\/\/|t\.me\/|telegram\.me\/)/gi)||[];
 if(links.length>=5)return true;
 if(!links.length)return false;
 return /稳赚不赔|保证盈利|保本高收益|私聊.{0,12}(?:转账|返利)|(?:助记词|私钥).{0,20}(?:提交|验证|填写)/i.test(text);
}
function pairLinks(path:string,campaign:string):string{
 return [
  "国际站："+trackedLink(path,campaign,"community","telegram"),
  "国内站："+trackedCNLink(path,campaign,"community","telegram"),
 ].join("\n");
}
function answer(cmd:string){
 switch(cmd.trim().split(/\s+/)[0]?.toLowerCase().replace(/@globalsiai_officialbot$/,"")){
  case "/start":case "/help":
   return [
    "欢迎来到全球 SIAI 排行榜官方社区！",
    "📄 灵犀场工具和全球 SIAI 排行榜：",
    pairLinks("/","bot_help"),
    "发送 /tools 查看工具，/ranking 查看排行榜。",
    "官方群组：https://t.me/globalsiai",
    "请勿发广告、诈骗链接或账号密钥。",
   ].join("\n");
  case "/tools":return "灵犀场在线工具：\n"+pairLinks("/tools","bot_tools");
  case "/ranking":return "全球 SIAI 排行榜：\n"+pairLinks("/siai","bot_ranking");
  case "/community":return "官方 Telegram 群组：https://t.me/globalsiai\n官网：\n"+pairLinks("/","bot_community");
  default:return null;
 }
}
async function installWebhook(ctx:NonNullable<ReturnType<typeof config>>){
 const endpoint=`${ctx.url}/functions/v1/globalsiai-bot`;
 const secret=await sha256(`telegram_webhook:${ctx.token}`);
 await telegram(ctx.token,"setWebhook",{
  url:endpoint,secret_token:secret,
  allowed_updates:["message"],drop_pending_updates:false,
 });
}
async function logDailyMetrics(ctx:NonNullable<ReturnType<typeof config>>,date:string){
 try{
  const memberCount=await telegram(ctx.token,"getChatMemberCount",{chat_id:GROUP}).catch(()=>null);
  const filter=`?select=event_key&event_kind=eq.daily&status=eq.delivered&event_key=like.${encodeURIComponent("post:"+date+":%")}`;
  const r=await db(ctx,"telegram_community_events","GET",undefined,filter);
  if(!r.ok)return;
  const delivered=await r.json();
  const m=await db(ctx,"telegram_community_daily_metrics","POST",{
   snapshot_day:date,
   member_count:Number.isSafeInteger(memberCount)?memberCount:null,
   posts_delivered:Math.min(5,delivered.length),
   observed_at:new Date().toISOString(),
  },"?on_conflict=snapshot_day",{"Prefer":"resolution=merge-duplicates,return=minimal"});
  if(!m.ok)console.error("TELEGRAM_METRICS_WRITE_FAILED");
 }catch{console.error("TELEGRAM_METRICS_UNAVAILABLE")}
}
async function publish(req:Request,ctx:NonNullable<ReturnType<typeof config>>){
 const supplied=req.headers.get("x-lx-schedule-key")||"";
 if(!supplied||supplied.length>128 || await sha256(supplied)!==SCHEDULER_KEY_SHA256)return respond(401,{error:"UNAUTHORIZED"});
 const content=await req.text();
 if(content.length>4096)return respond(413,{error:"TOO_LARGE"});
 let body:{slot?:string; action?:string};
 try{body=JSON.parse(content)}catch{return respond(400,{error:"BAD_JSON"})}
 if(body.action==="status"){
  try {
   const [me,wh,members]=await Promise.all([
    telegram(ctx.token,"getMe",{}),
    telegram(ctx.token,"getWebhookInfo",{}),
    telegram(ctx.token,"getChatMemberCount",{chat_id:GROUP}).catch(()=>null),
   ]);
   return respond(200,{
    ok:true,
    botUsername:typeof me.username==="string"?me.username:null,
    webhookUrl:typeof wh.url==="string"?wh.url:null,
    webhookPending:Number.isSafeInteger(wh.pending_update_count)?wh.pending_update_count:null,
    webhookLastError:typeof wh.last_error_message==="string"?wh.last_error_message:null,
    groupMembers:Number.isSafeInteger(members)?members:null,
   });
  }catch{return respond(503,{error:"DIAGNOSTICS_UNAVAILABLE"})}
 }
 if(body.action==="setup"){
  try{await installWebhook(ctx);return respond(200,{ok:true,webhook:"registered"})}
  catch{return respond(503,{error:"WEBHOOK_SETUP_FAILED"})}
 }
 if(body.action==="smoke"){
  const key=`smoke:${singaporeDay(new Date())}`;
  try{
   await installWebhook(ctx);
   if(!(await claim(ctx,key,"webhook")))return respond(200,{ok:true,duplicate:true});
   try{
    await telegram(ctx.token,"sendMessage",{
     chat_id:GROUP,text:"全球 SIAI 官方机器人连接测试成功。每日 5 次精选工具与教程发布已经设置好。\n欢迎交流：https://t.me/globalsiai",
     link_preview_options:{is_disabled:true},
    });
    await status(ctx,key,"delivered");
    return respond(200,{ok:true,smoke:"delivered"});
   }catch{
    await status(ctx,key,"failed");
    return respond(503,{error:"SMOKE_FAILED"});
   }
  }catch{return respond(503,{error:"SMOKE_UNAVAILABLE"})}
 }
 const slot=body.slot;
 if(!slot||!SLOTS.includes(slot as TelegramSlot))return respond(400,{error:"BAD_SLOT"});
 if(singaporeHour(new Date())!==SLOT_HOURS[slot as TelegramSlot])return respond(409,{error:"OUTSIDE_SLOT"});
 const day=singaporeDay(new Date()),key=`post:${day}:${slot}`;
 try{
  await installWebhook(ctx);
  if(!(await claim(ctx,key,"daily")))return respond(200,{ok:true,duplicate:true,slot});
  try{
   await telegram(ctx.token,"sendMessage",{
    chat_id:GROUP,text:buildPost(new Date(),slot as TelegramSlot,"telegram"),
    link_preview_options:{is_disabled:true},
   });
   await status(ctx,key,"delivered");
   if(slot==="community")await logDailyMetrics(ctx,day);
   return respond(200,{ok:true,slot,day});
  }catch{
   await status(ctx,key,"failed");
   return respond(503,{error:"PUBLISH_FAILED"});
  }
 }catch{return respond(503,{error:"SERVICE_UNAVAILABLE"})}
}
async function webhook(req:Request,ctx:NonNullable<ReturnType<typeof config>>){
 const expected=await sha256(`telegram_webhook:${ctx.token}`);
 if(req.headers.get("x-telegram-bot-api-secret-token")!==expected)return respond(401,{error:"UNAUTHORIZED"});
 const text=await req.text();
 if(text.length>65536)return respond(413,{error:"TOO_LARGE"});
 let update:TelegramUpdate;
 try{update=JSON.parse(text)}catch{return respond(400,{error:"BAD_JSON"})}
 if(!Number.isSafeInteger(update?.update_id))return respond(400,{error:"BAD_UPDATE"});
 const m=update.message;
 if(!m||m.from?.is_bot)return respond(200,{ok:true,ignored:true});
 const privateChat=m.chat.type==="private";
 if(!privateChat&&!allowed(m.chat))return respond(200,{ok:true,ignored:true});
 const command=m.text?answer(m.text):null;
 const join=!privateChat&&m.new_chat_members?.some(u=>!u.is_bot);
 const remove=!privateChat&&!command&&spam(m.text||"");
 if(!command&&!join&&!remove)return respond(200,{ok:true,ignored:true});
 const key=`update:${update.update_id}`;
 try{
  if(!(await claim(ctx,key,"webhook")))return respond(200,{ok:true,duplicate:true});
  try{
   if(remove)await telegram(ctx.token,"deleteMessage",{chat_id:m.chat.id,message_id:m.message_id});
   else await telegram(ctx.token,"sendMessage",{
    chat_id:m.chat.id,text:command||["欢迎加入全球 SIAI 社区！","免费实用工具与全球模型比较：",pairLinks("/","welcome"),"发送 /tools 或 /ranking 获取具体页面。","请文明交流，不发布广告或诈骗信息。"].join("\n"),
    link_preview_options:{is_disabled:true},
   });
   await status(ctx,key,"delivered");
   return respond(200,{ok:true});
  }catch{await status(ctx,key,"failed");return respond(503,{error:"HANDLING_FAILED"})}
 }catch{return respond(503,{error:"STORAGE_UNAVAILABLE"})}
}
Deno.serve(async req=>{
 if(req.method==="GET")return respond(200,{ok:true,service:"globalsiai-bot",mode:"supabase-free"});
 if(req.method!=="POST")return respond(405,{error:"METHOD_NOT_ALLOWED"});
 const ctx=config();
 if(!ctx)return respond(503,{error:"BOT_SECRET_NOT_CONFIGURED"});
 try{
  if(req.headers.has("x-lx-schedule-key"))return await publish(req,ctx);
  return await webhook(req,ctx);
 }catch{return respond(503,{error:"INTERNAL_FAILURE"})}
});
