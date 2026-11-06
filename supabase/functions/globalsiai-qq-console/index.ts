import {buildGroupPosts, QQ_GROUPS, singaporeDay, type QQGroupId} from "./editorial.ts";

/**
 * Supabase's shared *.supabase.co gateway intentionally rewrites HTML responses
 * as text/plain and applies a sandbox CSP. Return real UTF-8 text instead.
 * A JSON mode is available for a future official QQ bot integration.
 */
const names:Record<QQGroupId,string>={
  "1074475201":"灵犀场｜PDF、图片、视频与实用文件工具",
  "1072178710":"灵犀场｜SASI 智能创作、剧本与分镜",
  "601549887":"全球 SIAI 排行榜｜厂商、模型、价格与地区",
};
const announcements:Record<QQGroupId,string>={
  "1074475201":"欢迎来到灵犀场实用工具交流群！交流 PDF 编辑、OCR、图片与视频处理。\n国际站：https://lingxifield.com\n国内站：https://lingxifield.cn\n请勿刷屏、索取账户密钥或发布诈骗广告。",
  "1072178710":"欢迎来到 SASI 创作与 SIAI 工具交流群！分享脚本、分镜、配音、视频创作与模型比较。\n国际站：https://lingxifield.com\n国内站：https://lingxifield.cn\n请勿发布虚假价格和收益承诺。",
  "601549887":"原 WB3 群逐步转型为全球 SIAI 排行榜社区，交流全球 SI/AI 模型、厂商、价格、地区与商用规则。\n国际站：https://lingxifield.com/siai\n国内站：https://lingxifield.cn/siai\n可以提出资料补充与改进建议。",
};
const headings=["今日工具发现","实用教程","能力与限制比较","创作实践","晚间交流"];
function localDay(query:string|null):string{
  if(query && /^\d{4}-\d{2}-\d{2}$/.test(query)){
    const d=new Date(query+"T04:00:00Z");
    if(!Number.isNaN(d.getTime()) && singaporeDay(d)===query)return query;
  }
  return singaporeDay(new Date());
}
function reply(body:string,type="text/plain; charset=utf-8",status=200){
  return new Response(body,{
    status,headers:{
      "content-type":type,"cache-control":"no-store","x-content-type-options":"nosniff",
      "x-robots-tag":"noindex,nofollow","referrer-policy":"no-referrer",
    },
  });
}
Deno.serve((request:Request)=>{
  if(request.method!=="GET")return reply("Method Not Allowed","text/plain; charset=utf-8",405);
  const url=new URL(request.url);
  const id=QQ_GROUPS.some(x=>x.id===url.searchParams.get("group"))
    ?url.searchParams.get("group") as QQGroupId:"1074475201";
  const day=localDay(url.searchParams.get("day"));
  const posts=buildGroupPosts(new Date(day+"T04:00:00Z"),id);
  if(url.searchParams.get("format")==="json"){
    return reply(JSON.stringify({group:id,name:names[id],date:day,announcement:announcements[id],posts}),
      "application/json; charset=utf-8");
  }
  const blocks=posts.map((p,i)=>[
    "━━━━ 第 "+(i+1)+" 条｜"+p.label+"｜"+headings[i]+" ━━━━",
    p.text
  ].join("\n"));
  // BOM helps browsers distinguish UTF-8 Chinese from a legacy code page.
  return reply("\uFEFF"+[
    "灵犀场 LINGXIFIELD · 三群专属文案",
    "QQ群："+id+"｜"+names[id],
    "日期："+day,
    "【群公告】",
    announcements[id],
    "",
    ...blocks.map(x=>x+"\n"),
    "发送建议：按时段分别发送，勿连续刷屏或每日 @全体。",
    "这是可复制的纯文本版本，不是 QQ 自动发送结果。",
  ].join("\n"));
});
