"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {TOOLS} from "@/lib/tools/registry";
import {ADVANCED_TOOLS,ADVANCED_CATEGORY_LABELS,type AdvancedToolCategory} from "@/lib/tools/advanced-catalog";
import UniversalFileRouter from "./UniversalFileRouter";
import {trackToolEvent} from "@/lib/tools/analytics-client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {publicHubText} from "@/lib/public-hub-i18n";
import {advancedToolCopy,advancedCategoryLabel} from "@/lib/advanced-tools-i18n";

const quickZh=["文件传不上去","PDF 改文字并盖章","图片去文字","视频翻成中文","这顿饭多少热量","照片压到 100KB"];
const quickEn=["File will not upload","Edit PDF text and add an authorized stamp","Remove text from image","Translate a video","Estimate meal calories","Compress photo to 100KB"];
const aliasMap:Record<string,string[]>={
 pdf:["pdf","合同","文档","改字","编辑","拆分","合并","document","contract","edit","merge","split"],
 sign:["签名","盖章","公章","印章","电子章","骑缝章","signature","stamp","seal"],
 image:["图片","照片","水印","去文字","压缩","尺寸","image","photo","watermark","compress","resize","heic","jpg","png"],
 video:["视频","字幕","翻译","配音","压缩","video","subtitle","translate","dubbing","compress","audio"],
 privacy:["隐私","定位","元数据","privacy","gps","exif","metadata","qr"],
 daily:["卡路里","热量","食物","证件","复印","calorie","food","id","copy","a4"],
};
function score(text:string,hay:string){const q=text.trim().toLowerCase();if(!q)return 1;const parts=q.split(/\s+/).filter(Boolean);let s=0;for(const p of parts)if(hay.includes(p))s+=3;for(const[k,arr]of Object.entries(aliasMap))if(arr.some(a=>q.includes(a))&&hay.includes(k))s+=2;return s;}

export default function ToolsConversationHub(){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>publicHubText(lang,zh,en);const zh=lang==="zh";
 const[query,setQuery]=useState(""),[sent,setSent]=useState(""),[recent,setRecent]=useState<string[]>([]),[fav,setFav]=useState<string[]>([]);
 useEffect(()=>{try{setRecent(JSON.parse(localStorage.getItem("lx-tools-recent")||"[]"));setFav(JSON.parse(localStorage.getItem("lx-tools-fav")||"[]"));}catch{}},[]);
 const base=useMemo(()=>TOOLS.filter(x=>x.status==="live").map(x=>({href:`/tools/${x.slug}`,title:zh?x.titleZh:x.titleEn,description:zh?x.oneLinerZh:x.oneLinerEn,keywords:[x.titleZh,x.titleEn,...(x.keywords||[])],category:"developer" as AdvancedToolCategory,localOnly:x.localOnly})),[zh]);
 const advanced=useMemo(()=>ADVANCED_TOOLS.map(x=>advancedToolCopy(x,lang)),[lang]);
 const all=useMemo(()=>[...advanced,...base].filter((x,i,a)=>a.findIndex(y=>y.href===x.href)===i),[advanced,base]);
 const ranked=useMemo(()=>all.map(x=>({...x,_score:score(query,[x.title,x.description,...x.keywords,x.category].join(" ").toLowerCase())})).filter(x=>!query.trim()||x._score>0).sort((a,b)=>b._score-a._score),[all,query]);
 const quick=zh?quickZh:quickEn;
 function submit(v=query){const q=v.trim();if(!q)return;setQuery(q);setSent(q);}
 function remember(href:string){trackToolEvent("tool_open",href,{});const n=[href,...recent.filter(x=>x!==href)].slice(0,8);setRecent(n);localStorage.setItem("lx-tools-recent",JSON.stringify(n));}
 function toggleFav(href:string){const n=fav.includes(href)?fav.filter(x=>x!==href):[...fav,href];setFav(n);localStorage.setItem("lx-tools-fav",JSON.stringify(n));}
 const popular=all.filter(x=>("popular" in x)&&x.popular).slice(0,10);const groups=Object.keys(ADVANCED_CATEGORY_LABELS) as AdvancedToolCategory[];
 useEffect(()=>{if(sent)trackToolEvent("tool_search","tools-home",{query:sent,matched_count:ranked.length})},[sent,ranked.length]);

 return <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-7 sm:px-6">
  <div className="mx-auto max-w-3xl"><p className="text-sm font-medium text-slate-500">{t("灵犀场 · 一念即达 · 一念显化","LINGXIFIELD · One thought, one path")}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{t("你今天想解决什么？","What do you want to solve today?")}</h1><p className="mt-3 text-base leading-7 text-slate-600">{t("不用懂 OCR、FFmpeg 或 EXIF。直接说你要的结果。","You do not need to know OCR, FFmpeg or EXIF. Just describe the result you want.")}</p>
   <div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_10px_40px_rgba(15,23,42,.06)]"><textarea value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}} rows={3} placeholder={t("比如：这个 PDF 我要改名字、加公章，再加骑缝章……","For example: edit a name in this PDF, add an authorized stamp, then add a page-edge seal…")} className="w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-400"/><div className="flex items-center justify-between gap-3 px-2 pb-1"><span className="text-xs text-slate-400">Enter · {t("发送","Send")}</span><button onClick={()=>submit()} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">{t("帮我处理","Find a tool")}</button></div></div>
   <div className="mt-4 flex flex-wrap gap-2">{quick.map(x=><button key={x} onClick={()=>submit(x)} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:border-blue-200 hover:text-blue-700">{x}</button>)}</div>
   {sent&&<div className="mt-8 space-y-4"><div className="ml-auto max-w-[82%] rounded-3xl rounded-br-lg bg-blue-600 px-4 py-3 text-[15px] leading-7 text-white">{sent}</div><div className="max-w-[88%] rounded-3xl rounded-bl-lg bg-slate-100 px-4 py-3 text-[15px] leading-7 text-slate-700">{t("我找到了","I found")} {ranked.length} {t("个能执行的入口。最相关的排在前面。","executable options. The most relevant are first.")}</div></div>}
   <UniversalFileRouter/>
  </div>
  {!query.trim()&&<div className="mt-10"><h2 className="text-xl font-semibold text-slate-950">{t("🔥 大家都在用","🔥 Popular now")}</h2><ToolGrid items={popular} fav={fav} remember={remember} toggleFav={toggleFav} lang={lang}/></div>}
  {(recent.length>0||fav.length>0)&&!query.trim()&&<div className="mt-8 grid gap-6 lg:grid-cols-2">{recent.length>0&&<section><h2 className="font-semibold text-slate-900">{t("最近使用","Recently used")}</h2><div className="mt-3 flex flex-wrap gap-2">{recent.map(h=>{const x=all.find(y=>y.href===h);return x?<Link key={h} href={h} className="rounded-full border border-slate-200 px-3 py-2 text-sm">{x.title}</Link>:null})}</div></section>}{fav.length>0&&<section><h2 className="font-semibold text-slate-900">{t("收藏","Favorites")}</h2><div className="mt-3 flex flex-wrap gap-2">{fav.map(h=>{const x=all.find(y=>y.href===h);return x?<Link key={h} href={h} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{x.title}</Link>:null})}</div></section>}</div>}
  <div className="mt-10 border-t border-slate-200 pt-8">{query.trim()?<><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-950">{t("搜索结果","Search results")}</h2><span className="text-sm text-slate-400">{ranked.length} {t("个","items")}</span></div><ToolGrid items={ranked} fav={fav} remember={remember} toggleFav={toggleFav} lang={lang}/></>:groups.map(g=>{const list=all.filter(x=>x.category===g);if(!list.length)return null;return <section key={g} className="mb-9"><h2 className="text-xl font-semibold text-slate-950">{advancedCategoryLabel(g,lang)}</h2><ToolGrid items={list} fav={fav} remember={remember} toggleFav={toggleFav} lang={lang}/></section>})}{query.trim()&&ranked.length===0&&<div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{t("暂时没有真实可执行的匹配项。这个关键词应记录到“未命中搜索”，作为下一批需求。","No genuinely executable match yet. This query should be recorded as an unmet search for future tool development.")}</div>}</div>
 </div>;
}
function ToolGrid({items,fav,remember,toggleFav,lang}:{items:any[];fav:string[];remember:(h:string)=>void;toggleFav:(h:string)=>void;lang:any}){const t=(zh:string,en:string)=>publicHubText(lang,zh,en);return <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(x=><div key={x.href} className="relative rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-[0_12px_34px_rgba(37,99,235,.07)]"><button onClick={()=>toggleFav(x.href)} className="absolute right-3 top-3 text-lg text-slate-300 hover:text-blue-600" aria-label={t("收藏","Favorites")}>{fav.includes(x.href)?"★":"☆"}</button><Link href={x.href} onClick={()=>remember(x.href)} className="block pr-7"><div className="flex gap-2"><h3 className="text-[15px] font-semibold text-slate-900">{x.title}</h3>{x.badge&&<span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">{x.badge}</span>}</div><p className="mt-2 text-sm leading-6 text-slate-500">{x.description}</p>{x.localOnly&&<p className="mt-2 text-[11px] text-emerald-700">🔒 {t("本地处理，不上传文件","Local processing; file is not uploaded")}</p>}</Link></div>)}</div>}
