import {buildGroupPosts,QQ_GROUPS,singaporeDay,type QQGroupId} from "./editorial.ts";

/** Public read-only QQ copy desk. No bot keys and no QQ session access. */
const notices:Record<QQGroupId,string>={
 "1074475201":"欢迎来到灵犀场实用工具交流群！PDF 编辑、图片、视频字幕、OCR 等教程，会用简短步骤介绍。\n国际站：https://lingxifield.com\n国内站：https://lingxifield.cn\n欢迎提出实际问题，禁止广告与诈骗。",
 "1072178710":"欢迎来到灵犀场 SASI 创作与全球 SIAI 交流区！分享脚本、分镜、视频配音及模型比较，价格和免费额度以官方资料为准。\n国际站：https://lingxifield.com\n国内站：https://lingxifield.cn\n不发布夸大收益或虚构功能。",
 "601549887":"【群组转型公告】原 WB3 群计划调整为全球 SIAI 排行榜社区，交流智能模型、全球工具行情、使用地区和创作经验。欢迎老群友提出建议。\n国际站：https://lingxifield.com/siai\n国内站：https://lingxifield.cn/siai\n请勿刷屏、发布诈骗广告。",
};
function esc(s:string):string{
 return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
   .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function cleanDay(value:string|null):string{
 if(value&&/^\d{4}-\d{2}-\d{2}$/.test(value)){
  const d=new Date(value+"T04:00:00Z");
  if(!Number.isNaN(d.getTime())&&singaporeDay(d)===value)return value;
 }
 return singaporeDay(new Date());
}
Deno.serve((request)=>{
 if(request.method!=="GET")return new Response("Method Not Allowed",{status:405,headers:{allow:"GET"}});
 const query=new URL(request.url).searchParams;
 const gid=QQ_GROUPS.some(g=>g.id===query.get("group"))?query.get("group") as QQGroupId:"1074475201";
 const day=cleanDay(query.get("day"));
 const dayDate=new Date(day+"T04:00:00Z");
 const posts=buildGroupPosts(dayDate,gid);
 const group=QQ_GROUPS.find(g=>g.id===gid)!;
 const nonce=crypto.randomUUID().replace(/-/g,"");
 const jsPosts=JSON.stringify(posts.map(x=>x.text)).replace(/</g,"\\u003c");
 const jsNotice=JSON.stringify(notices[gid]).replace(/</g,"\\u003c");
 const cards=posts.map((p,i)=>`<article class="card"><div class="cardhead"><div><small>第 ${i+1} 条 · ${esc(p.label)}</small><h3>${esc(["全球 SIAI 发现","实用工具教程","模型与价格对比","SASI 智能创作","今晚聊什么？"][i])}</h3></div><button type="button" data-copy="${i}">复制这一条</button></div><pre>${esc(p.text)}</pre></article>`).join("");
 const html=String.raw`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
 <meta name="robots" content="noindex,nofollow"><title>灵犀场｜三个 QQ 群运营文案</title>
 <style nonce="${nonce}">
 :root{font-family:system-ui,"Microsoft YaHei",sans-serif;color:#14213a;background:#f4f7fc}
 *{box-sizing:border-box}body{margin:0}.wrap{max-width:880px;margin:auto;padding:25px 16px 50px}
 h1{font-size:28px;line-height:1.3;margin:6px 0 10px}h2{font-size:19px;margin:0 0 14px}h3{font-size:17px;margin:5px 0;color:#1d2a44}
 p{line-height:1.75;color:#53627b}small{font-size:14px;color:#516ba1;font-weight:700}
 .eyebrow{font-weight:750;color:#375b9c;font-size:14px}
 .panel,.card{background:#fff;border:1px solid #dfebfa;border-radius:18px;padding:17px;margin:16px 0;box-shadow:0 2px 12px #1a3e6510}
 .filter{display:flex;gap:12px;align-items:end;flex-wrap:wrap}.filter label{display:grid;gap:7px;font-weight:700;font-size:14px;flex:1;min-width:180px}
 select,input{border:1px solid #cad8ed;padding:12px;border-radius:10px;font-size:16px;width:100%;background:white}
 button{background:#1e4eb5;border:0;border-radius:10px;padding:11px 15px;color:white;font-weight:700;font-size:15px;cursor:pointer}
 button.secondary{background:#e7f0ff;color:#2355ac}button:hover{filter:brightness(.94)}pre{font-family:inherit;font-size:15px;line-height:1.85;white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f8fd;padding:14px;border-radius:12px;margin:13px 0 0}
 .cardhead{display:flex;align-items:center;justify-content:space-between;gap:10px}.cardhead button{flex-shrink:0}
 .status{min-height:20px;font-weight:700;color:#16723f}a{color:#1e4eb5}.notice{border-left:4px solid #3a6ac9;padding-left:14px}
 .ops{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}.foot{font-size:14px;line-height:1.8}
 @media(max-width:600px){.cardhead{align-items:start}.cardhead button{padding:9px 10px;font-size:14px}.wrap{padding:20px 12px}h1{font-size:24px}}
 </style></head>
 <body><main class="wrap">
 <p class="eyebrow">LINGXIFIELD · 全球 SIAI 排行榜</p>
 <h1>3 个 QQ 群 · 每日五条运营工作台</h1>
 <p>选择群号与日期，复制适合该群的文案。每条均包含 <b>.com 国际站</b>与<b>.cn 国内站</b>，分别统计三个群的引流来源。不会自动登录 QQ 或擅自群发。</p>
 <section class="panel"><form class="filter" method="get">
  <label>选择 QQ 群<select name="group">${QQ_GROUPS.map(g=>`<option value="${g.id}" ${g.id===gid?"selected":""}>${g.id} · ${esc(g.focus)}</option>`).join("")}</select></label>
  <label>选择日期<input type="date" name="day" value="${day}"></label><button type="submit">更新文案</button>
 </form><p>当前群：<b>${gid} · ${esc(group.focus)}</b></p></section>
 <section class="panel"><h2>精简群公告 / 转型说明</h2><pre class="notice">${esc(notices[gid])}</pre>
  <div class="ops"><button data-copy="notice">复制群公告</button><button class="secondary" data-copy="all">复制今天五条</button></div></section>
 <div class="status" role="status" id="status" aria-live="polite"></div>
 <section><h2>${day} · 分时段发布（北京时间/新加坡时间）</h2>${cards}</section>
 <p class="foot">群管理建议：不要每日反复 @全体成员；不要使用挂机号/非官方协议发送广告。QQ 内置「Q群管家」的定时任务必须由拥有对应群权限的人在 QQ 客户端设置。本页面只读，不采集 QQ 登录信息、密钥或成员名单。群内发布效果以实际页面访问和订单为准。</p>
 </main><script nonce="${nonce}">
 const posts=${jsPosts};const notice=${jsNotice};
 document.querySelectorAll("[data-copy]").forEach(button=>button.addEventListener("click",async()=>{
  const id=button.getAttribute("data-copy");
  const value=id==="notice"?notice:id==="all"?posts.map((p,i)=>"【第 "+(i+1)+" 条】\n"+p).join("\n\n────────\n\n"):posts[Number(id)];
  try{await navigator.clipboard.writeText(value);document.getElementById("status").textContent="已复制，打开 QQ 对应群粘贴即可。"}
  catch{document.getElementById("status").textContent="浏览器不支持自动复制，请长按上方文字复制。"}
 }));
 </script></body></html>`;
 return new Response(html,{status:200,headers:{
  "content-type":"text/html; charset=utf-8",
  "cache-control":"no-store",
  "x-robots-tag":"noindex,nofollow",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
  "content-security-policy":`default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`,
 }});
});
