import type {AITool} from "./catalog";
export const terminalCategories:Record<string,string>={Assistants:"综合",Video:"视频",Design:"图片",Agents:"智能体",Documents:"办公",Coding:"编程",Building:"建站",Audio:"音频",Science:"科研",SEO:"SEO/GEO",Research:"搜索研究",Automation:"自动化"};
export function categoryMatches(t:AITool,category:string){
 if(category==="Agents")return t.tags.includes("agent");
 if(category==="Science")return ["elicit","consensus"].includes(t.slug);
 if(category==="Building")return ["bolt-new","lovable","v0","replit"].includes(t.slug);
 return !category||t.category===category;
}
export function selectTerminalRows(tools:readonly AITool[],query:string,category:string,sort:string){
 const aliases:Record<string,string>={"做视频":"video","视频":"video","画图设计":"design","图片":"image","写代码":"coding","编程":"coding","查资料":"research","搜索":"search","做音乐":"music","音乐":"music","建站":"website","写作":"writing","翻译":"translation","自动化":"automation"};
 const raw=query.trim().toLowerCase().slice(0,100);
 const q=aliases[raw]||raw;
 const named=tools.filter(t=>raw===t.name.toLowerCase()||(!["make","consensus","v0"].includes(t.name.toLowerCase())&&raw.includes(t.name.toLowerCase()))).map(t=>t.slug);
 const question=/免费|额度|每天|次数|积分|多少钱|价格|费用|水印|商用|失败|扣费|退款|手机号|手机号码|信用卡|大陆|地区|国内|\bfree\b|\bcredits?\b|watermark|commercial|refund/i.test(raw);
 const task=/视频|video/i.test(raw)?"Video":/图片|画图|image/i.test(raw)?"Design":/编程|写代码|coding/i.test(raw)?"Coding":"";
 return tools.filter(t=>categoryMatches(t,category)&&(!q||(named.length?named.includes(t.slug):question?(!task||t.category===task):[t.name,t.provider,t.category,t.description,...t.tags].join(" ").toLowerCase().includes(q))))
 .sort((a,b)=>(sort==="vendor"?a.provider.localeCompare(b.provider):sort==="category"?a.category.localeCompare(b.category):a.name.localeCompare(b.name))||a.slug.localeCompare(b.slug));
}
export function selectedProductIds(raw:unknown,known:readonly string[],limit=5):string[]{
 if(!Array.isArray(raw))return [];
 return [...new Set(raw.filter((s):s is string=>typeof s==="string"&&known.includes(s)))].slice(0,limit);
}
export function compareProductHref(ids:readonly string[],known:readonly string[]){return "/ai/compare?"+new URLSearchParams({products:selectedProductIds(ids,known).join(",")}).toString();}
