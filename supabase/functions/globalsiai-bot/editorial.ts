import {QQ_EDITORIAL, QQ_WEEKS, QQ_WEEKLY_TASKS} from "./qq-editorial.ts";
/** Evidence-safe, seven-day rotating publication library. Claims requiring fresh verification must be reviewed before addition. */
export type TelegramSlot = "discovery" | "tutorial" | "comparison" | "creation" | "community";
export type PublicChannel = "telegram" | "qq";
export const TELEGRAM_SLOTS: TelegramSlot[] = ["discovery","tutorial","comparison","creation","community"];
export const SLOT_LABELS: Record<TelegramSlot,string> = {
 discovery:"09:00–09:59", tutorial:"11:00–11:59", comparison:"14:00–14:59", creation:"17:00–17:59", community:"20:00–20:59",
};
export const SLOT_HOURS: Record<TelegramSlot,number> = {discovery:9,tutorial:11,comparison:14,creation:17,community:20};
type Entry = readonly [title:string, detail:string, path:string, action:string, question:string];
const TG_WEEKS=["新手精选","实用进阶","避坑提醒","真实反馈"] as const;
const TG_WEEKLY_TASKS:Record<TelegramSlot,readonly [string,string,string,string]>={
  "discovery": [
    "今日先从实际需求选工具，不按热榜盲目决定；用两条条件筛出候选。",
    "把一款热门工具的免费额度与使用地区分开核对，记录差异。",
    "核对官方条款的生效日期与版本，旧信息不要当最新资料传播。",
    "选一个上周没解决的工具问题，征集实际操作反馈再给建议。"
  ],
  "tutorial": [
    "先找一个不含隐私数据的小样本试操作，完成后检查能否下载。",
    "换一台手机或另一个浏览器打开输出文件，检验兼容性。",
    "把最容易失败的一步和页面提示文字记下来，再逐项排查。",
    "整理成功与失败的操作步骤，让教程更容易理解。"
  ],
  "comparison": [
    "尽量用相同任务和输出要求测试，不拿不同条件的结果比较。",
    "把免费层、订阅、按量付费三种口径拆开后再讨论成本。",
    "核实厂商的地区、商用与支付限制，不能只比较功能宣传。",
    "征集一项最想新增的对比字段，有官方证据才进入资料。"
  ],
  "creation": [
    "先明确作品时长、目标观众和情绪，再写三镜分镜。",
    "同一素材制作两个不同开头，在手机端比较可读性与节奏。",
    "检查字幕、配音和画面是否一致，特别是转场与音量。",
    "选一段最满意的成果复做一次，验证流程能否稳定复现。"
  ],
  "community": [
    "提出最想学习的一个操作，下一轮优先整理可复现教程。",
    "请每人分享一个省时工具，说明使用的实际任务而非空泛好评。",
    "今晚集中收集失效页面与难用流程，描述输入、动作、结果即可。",
    "整理本周最常问的三个问题，建议优先完善真正高频的操作。"
  ]
};

const data: Record<TelegramSlot, readonly Entry[]> = {
  "discovery": [
    [
      "AI 工具一大堆，为什么越搜越难选？",
      "先明确任务，再比较语言、功能、免费额度、地区与商用条件。热门不等于适合自己。",
      "/siai",
      "按需求筛选全球 SIAI 工具",
      "你更想比较文字、图像还是视频？"
    ],
    [
      "免费 AI 工具，就一定完全免费吗？",
      "查免费次数、导出限制、积分与商用条件；以官方实时套餐为准。",
      "/siai",
      "查看公开厂商资料",
      "你遇到过什么隐藏限制？"
    ],
    [
      "工具再强，地区不能用怎么办？",
      "先看使用地区、支付方式、下载限制与可商用条件，别只看演示。",
      "/siai",
      "按地区和功能比较",
      "你最关心地区还是价格？"
    ],
    [
      "AI 图片与 AI 视频，为什么不能混为一谈？",
      "生成模态、时长、分辨率、角色一致性和导出方式需要分开比较。",
      "/siai",
      "查看全球 SIAI 分类",
      "你最近想做什么内容？"
    ],
    [
      "工具名字太多，如何少走弯路？",
      "把需求分成写作、编程、图片、视频与资料整理，再选择对应类别。",
      "/siai",
      "打开能力分类",
      "用一句话告诉我们你的需求。"
    ],
    [
      "两款工具都写 AI，怎么比限制？",
      "核对免费额度、使用次数、API、地区、商用授权，不显示无证据资料。",
      "/siai",
      "比较已核验内容",
      "你最在意哪项限制？"
    ],
    [
      "只看月费，可能低估创作成本。",
      "视频与图像还可能按积分、时长和分辨率扣费；先用官方规则估算。",
      "/siai",
      "比较费用和能力",
      "你最想核实哪个平台的费用？"
    ]
  ],
  "tutorial": [
    [
      "PDF 签名，必须装软件吗？",
      "打开工具目录→选择 PDF 签名→定位→导出后重新打开确认。",
      "/tools",
      "查看 PDF 工具",
      "你还想学习哪种 PDF 操作？"
    ],
    [
      "几张图片，如何合成 PDF？",
      "准备图片→选择转换→调整页序→预览下载；原图记得备份。",
      "/tools",
      "试试图片转 PDF",
      "你更偏好 A4 还是原尺寸？"
    ],
    [
      "截图里的字，为什么复制不了？",
      "先用 OCR 识别，再校对错别字与特殊字符，复杂排版要人工检查。",
      "/tools",
      "查看 OCR 相关工具",
      "你更常识别截图还是票据？"
    ],
    [
      "视频太大传不上去？",
      "先压缩，再检查目标平台需要的清晰度，导出后回看画质和声音。",
      "/tools",
      "找到视频压缩工具",
      "你最常发竖屏还是横屏？"
    ],
    [
      "视频字幕太慢，能不能更简单？",
      "先语音转文字，检查时间轴和断句，再添加字幕样式。",
      "/tools",
      "查看字幕工具",
      "你的视频配音通常有多长？"
    ],
    [
      "图片比例不对，怎么减少重复劳动？",
      "先选平台比例与格式，再转换或批量处理，检查裁剪和失真。",
      "/tools",
      "浏览图片处理工具",
      "你常用 1:1 还是 9:16？"
    ],
    [
      "临时邮箱好用，哪些地方不能乱用？",
      "适合低风险测试；重要账号、支付和身份验证别依赖短期邮箱。",
      "/tools",
      "查看实用工具目录",
      "你最想要哪种轻量工具？"
    ]
  ],
  "comparison": [
    [
      "AI 绘图怎么比才不踩坑？",
      "先比输出画质、角色一致性、分辨率，再比商用和免费额度。",
      "/siai",
      "比较图像工具",
      "你要做封面还是产品图？"
    ],
    [
      "AI 视频价格，不止月费一个数字。",
      "要看生成时长、积分、分辨率与失败重试规则。",
      "/siai",
      "比较视频生成平台",
      "你要 5 秒还是 30 秒镜头？"
    ],
    [
      "编程助手该比哪些实际能力？",
      "看代码上下文、IDE 集成、可用模型、调用次数和数据使用条款。",
      "/siai",
      "查看编程工具资料",
      "你最常用哪个编辑器？"
    ],
    [
      "AI 研究答案靠谱吗？",
      "优先比较来源引用、更新日期、长文本理解与检索可靠性。",
      "/siai",
      "查看研究类工具",
      "你最常查哪类资料？"
    ],
    [
      "免费额度大，就一定划算吗？",
      "还应比较排队速度、实际导出限制与使用频率。",
      "/siai",
      "检查免费与付费限制",
      "你最不能接受什么限制？"
    ],
    [
      "AI 套餐能不能多人共享？",
      "先确认团队席位、账号共享和授权条款，不能默认允许。",
      "/siai",
      "比较官方套餐资料",
      "你是个人还是团队使用？"
    ],
    [
      "AI 生成的东西能商用吗？",
      "不同工具的授权和限制可能不同；以各厂商正式协议为准。",
      "/siai",
      "查看商用条款资料",
      "你主要做自媒体还是企业内容？"
    ]
  ],
  "creation": [
    [
      "做 AI 短剧，为什么看起来像拼图？",
      "先完成故事、分镜、角色设定、镜头转场，再逐段生成与剪辑。",
      "/sasi",
      "探索 SASI 智能创作",
      "你想做科幻还是悬疑？"
    ],
    [
      "同一角色，换镜头就变脸怎么办？",
      "固定角色特征、衣着、参考图和镜头描述，再逐镜检查。",
      "/sasi",
      "查看智能创作入口",
      "你更看重角色还是场景一致性？"
    ],
    [
      "短视频不吸引人，是特效不够吗？",
      "第一秒抛问题，中间给方法，最后展示可见结果；先优化结构。",
      "/sasi",
      "看看创作工具",
      "你通常拍 15 秒还是 60 秒？"
    ],
    [
      "字幕太多观众看不清？",
      "分成短句，确保手机可读，并让字幕与配音同步。",
      "/tools",
      "查看字幕处理工具",
      "你的字幕习惯居中还是靠底？"
    ],
    [
      "想做产品图，要先学复杂软件吗？",
      "先定构图和画面比例，再按需要使用去背景、压缩或转换工具。",
      "/tools",
      "浏览图片处理工具",
      "你最想做哪种产品图？"
    ],
    [
      "同一视频怎么适配多个平台？",
      "保留母版，再调整封面、比例与字幕安全区，导出后检查裁切。",
      "/tools",
      "查看视频和图片工具",
      "你主要发布哪个平台？"
    ],
    [
      "宇宙与神秘事件视频，最怕什么？",
      "用创作画面呈现想象，同时区分已证实事实、证言和未证实推测。",
      "/sasi",
      "查看创作工具",
      "你更爱宇宙还是历史谜团？"
    ]
  ],
  "community": [
    [
      "今晚投票：你最希望哪个工具好用？",
      "A.PDF｜B.图片｜C.视频字幕｜D.模型比较；回复字母，我们优先做相关教程。",
      "/tools",
      "先看看工具目录",
      "回复 A/B/C/D 就行。"
    ],
    [
      "今天你最想解决什么操作问题？",
      "只需一句话描述结果，例如“20 张照片变成一个 PDF”，不必懂工程术语。",
      "/tools",
      "查看在线工具",
      "把最困扰你的问题发出来。"
    ],
    [
      "别盲目拉群，分享给真正需要工具的人。",
      "这里讨论全球 SIAI 工具，也分享 PDF、视频、图片等实用教程。",
      "/siai",
      "让朋友看看排行榜",
      "欢迎邀请有实际需求的朋友。"
    ],
    [
      "排行榜还缺什么筛选条件？",
      "免费额度、使用地区、付款方式、商用授权、API、模型能力：你最看重哪项？",
      "/siai",
      "体验现有筛选",
      "回复你最想要的一项。"
    ],
    [
      "今晚效率挑战：少装一个软件。",
      "选一个日常文件任务，试试能否用浏览器完成，再交流体验。",
      "/tools",
      "开始浏览在线工具",
      "你刚完成了什么任务？"
    ],
    [
      "做短视频，你在哪一步最耗时？",
      "选题、脚本、分镜、画面、配音、字幕还是发布？",
      "/sasi",
      "探索智能创作",
      "留言你最难的一步。"
    ],
    [
      "本周实际体验：哪个工具帮你省了时间？",
      "分享可复现的步骤，欢迎反馈限制和失败场景。",
      "/tools",
      "回顾工具目录",
      "说说你实际用过的功能。"
    ]
  ]
};
export function singaporeDay(date:Date):string {
 const values=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Singapore",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date).map(v=>[v.type,v.value]));
 return `${values.year}-${values.month}-${values.day}`;
}
export function singaporeHour(date:Date):number {
 return Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Singapore",hour:"2-digit",hourCycle:"h23"}).format(date));
}
export function slotAtHour(date:Date):TelegramSlot|null {
 const hour=singaporeHour(date);
 return TELEGRAM_SLOTS.find(slot=>SLOT_HOURS[slot]===hour)||null;
}
export function trackedLink(path:string,campaign:string,slot:TelegramSlot,channel:PublicChannel):string {
 const url=new URL(path,"https://lingxifield.com");
 url.searchParams.set("utm_source",channel);
 url.searchParams.set("utm_medium","community");
 url.searchParams.set("utm_campaign",campaign);
 url.searchParams.set("utm_content",slot);
 return url.toString();
}
export const QQ_GROUPS = [
 {id:"1074475201",focus:"灵犀场免费工具与实用教程"},
 {id:"1072178710",focus:"灵犀场智能创作与全球 SIAI"},
 {id:"601549887",focus:"全球 SIAI 排行榜（原 WB3 群转型）"},
] as const;
export type QQGroupId = typeof QQ_GROUPS[number]["id"];
export function trackedCNLink(path:string,campaign:string,slot:TelegramSlot,channel:PublicChannel):string{
 const cn=new URL(trackedLink(path,campaign,slot,channel));
 cn.hostname="lingxifield.cn";
 return cn.toString();
}
export function buildGroupPosts(date:Date,groupId:QQGroupId):Array<{slot:TelegramSlot;label:string;text:string}>{
 return TELEGRAM_SLOTS.map(slot=>({slot,label:SLOT_LABELS[slot],text:buildPost(date,slot,"qq",groupId)}));
}
export function buildPost(date:Date,slot:TelegramSlot,channel:PublicChannel,qqGroup?:QQGroupId):string {
 const day=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Singapore",weekday:"short"}).format(date);
 const index=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(day);
 const idx=index<0?0:index;
 const [title,detail,path,action,question]=channel==="qq"
   ?QQ_EDITORIAL[qqGroup||"1074475201"][slot][idx]
   :data[slot][idx];
 const activeGroup=qqGroup||"1074475201";
 const dayNumber=Math.floor((new Date(singaporeDay(date)+"T00:00:00Z").getTime()-Date.UTC(2026,10,5))/86400000);
 const cycle=Math.floor((((dayNumber%28)+28)%28)/7);
 const weekNote=channel==="qq"
  ?"\n【"+QQ_WEEKS[cycle]+"】"+QQ_WEEKLY_TASKS[activeGroup][slot][cycle]
  :"\n【"+TG_WEEKS[cycle]+"】"+TG_WEEKLY_TASKS[slot][cycle];
 const prefix=channel==="qq"
   ? (qqGroup==="601549887"?"🌐 全球 SIAI 排行榜｜社区发现":"✨ 灵犀场 LINGXIFIELD｜每日实用技巧")
   : "🌐 全球 SIAI｜"+({discovery:"早间发现",tutorial:"实用教程",comparison:"工具对比",creation:"智能创作",community:"晚间问答"} as const)[slot];
 const campaign=channel==="qq"&&qqGroup?"qq_"+qqGroup+"_"+slot:"siai_"+slot;
 const lines=[prefix,"",`【${channel==="qq"?QQ_WEEKS[cycle]:TG_WEEKS[cycle]} · ${title}】`,detail+weekNote,"",`${action}：`,
   "国际站："+trackedLink(path,campaign,slot,channel),
   "国内站："+trackedCNLink(path,campaign,slot,channel),"",question];
 if(channel==="qq"&&slot==="community") lines.push("","全球 SIAI 交流群：https://t.me/globalsiai");
 return lines.join("\n");
}
export function buildFivePosts(date:Date,channel:PublicChannel):Array<{slot:TelegramSlot,label:string,text:string}> {
 return TELEGRAM_SLOTS.map(slot=>({slot,label:SLOT_LABELS[slot],text:buildPost(date,slot,channel)}));
}
