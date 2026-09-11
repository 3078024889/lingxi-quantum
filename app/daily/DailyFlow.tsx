"use client";
import {useState, useEffect, type ReactNode} from "react";
import Bi from "@/components/Bi";
import AssessmentWorkbench, {AssessmentEmpty} from "@/components/AssessmentWorkbench";
import BirthDateGuidance, {BirthTimeOptionalCopy, type CalendarType} from "@/components/BirthDateGuidance";
import ErrorWithLoginPrompt from "@/components/ErrorWithLoginPrompt";
import PortalSpinner from "@/components/PortalSpinner";
import {useLang} from "@/lib/useLang";
import {getProduct} from "@/lib/plans";
import {readDailyPreview} from "./actions";
import DailyPreview from "./DailyPreview";
const TEASER_CHAPTERS: { titleZh: string; titleEn: string; descZh: string; descEn: string }[] = [
  { titleZh: "\u4eca\u65e5\u6f6e\u6c50\u5165\u53e3", titleEn: "Today's Tide Gate", descZh: "\u7ed3\u5408\u4f60\u7684\u592a\u9633\u661f\u5ea7\u3001\u65e5\u4e3b\u4e94\u884c\uff0c\u548c\u4eca\u5929\u771f\u5b9e\u7684\u6f6e\u6c50\u5f3a\u5ea6\u3001\u6708\u4eae\u4f4d\u7f6e\uff0c\u5199\u51fa\u4eca\u5929\u5bf9\u4f60\u5177\u4f53\u610f\u5473\u7740\u4ec0\u4e48\u2014\u2014\u4e0d\u662f\u901a\u7528\u7684\"\u4eca\u65e5\u63d0\u793a\"\u3002", descEn: "Your fixed chart crossed with today's real tide and moon position \u2014 what today specifically means for you." },
  { titleZh: "\u4eca\u65e5\u884c\u52a8\u6f6e", titleEn: "Today's Action Tide", descZh: "\u7ed3\u5408\u6f6e\u6c50\u5f3a\u5ea6\u548c\u5f53\u65e5\u5b88\u62a4\u661f\uff0c\u5177\u4f53\u8bf4\u4eca\u5929\u9002\u5408\u5f80\u54ea\u4e2a\u65b9\u5411\u7528\u529b\u3001\u8282\u594f\u8be5\u5feb\u8fd8\u662f\u8be5\u7a33\u3002", descEn: "Tied to today's tide strength and ruling planet \u2014 where to push, and at what pace." },
  { titleZh: "\u4eca\u65e5\u521b\u9020\u6f6e", titleEn: "Today's Creation Tide", descZh: "\u7ed3\u5408\u4f60\u7684\u65e5\u4e3b\u4e94\u884c\u548c\u4eca\u5929\u7684\u6708\u76f8\uff0c\u5177\u4f53\u8bf4\u7075\u611f\u66f4\u5bb9\u6613\u5728\u4ec0\u4e48\u573a\u666f\u4e0b\u51fa\u73b0\u3002", descEn: "Tied to your element and today's moon phase \u2014 where inspiration is most likely to show up." },
  { titleZh: "\u4eca\u65e5\u5173\u7cfb\u6f6e", titleEn: "Today's Connection Tide", descZh: "\u7ed3\u5408\u6708\u4eae\u5143\u7d20\u4e0e\u4f60\u672c\u547d\u5143\u7d20\u7684\u5173\u7cfb\uff0c\u5177\u4f53\u8bf4\u4eca\u5929\u7684\u4eba\u9645\u4e92\u52a8\u5bb9\u6613\u987a\u7545\u8fd8\u662f\u5bb9\u6613\u6709\u6469\u64e6\u3002", descEn: "Tied to how today's moon element relates to your own \u2014 whether today favors ease or friction with others." },
  { titleZh: "\u4eca\u65e5\u4ef7\u503c\u6d41\u52a8\u6f6e", titleEn: "Today's Value Flow Tide", descZh: "\u4e0d\u5199\u53d1\u8d22\u9884\u6d4b\uff0c\u5199\u4eca\u5929\u9002\u5408\u89c2\u5bdf\u8d44\u6e90\u3001\u673a\u4f1a\u3001\u5408\u4f5c\u7684\u54ea\u4e2a\u5177\u4f53\u65b9\u9762\u3002", descEn: "Not a money prediction \u2014 where to actually look for resources, opportunity, or collaboration today." },
  { titleZh: "\u4eca\u65e5\u5185\u5728\u6f6e\u6c50", titleEn: "Today's Inner Tide", descZh: "\u7ed3\u5408\u6f6e\u6c50\u5f3a\u5ea6\u548c\u9006\u884c\u60c5\u51b5\uff0c\u5177\u4f53\u8bf4\u4eca\u5929\u66f4\u9002\u5408\u5411\u5916\u63a2\u7d22\u8fd8\u662f\u5411\u5185\u6574\u7406\u3002", descEn: "Tied to today's tide and any retrogrades \u2014 whether to reach outward or turn inward today." },
  { titleZh: "\u672a\u67657\u65e5\u6f6e\u6c50\u8d8b\u52bf", titleEn: "The Next 7 Days", descZh: "7\u5929\u540e\u6f6e\u6c50\u5f3a\u5ea6\u4f1a\u5230\u591a\u5c11\u2014\u2014\u771f\u5b9e\u7b97\u51fa\u6765\u7684\u6570\u5b57\uff0c\u4e0d\u662f\u7f16\u7684\uff0c\u63cf\u8ff0\u63a5\u4e0b\u6765\u4e00\u5468\u80fd\u91cf\u632f\u5e45\u600e\u6837\u53d8\u5316\u3002", descEn: "A real, calculated tide number seven days out \u2014 how the coming week's amplitude actually shifts." },
  { titleZh: "\u672a\u676530\u65e5\u6f6e\u6c50\u8d8b\u52bf", titleEn: "The Next 30 Days", descZh: "30\u5929\u540e\u6f6e\u6c50\u5f3a\u5ea6\u3001\u7ed3\u5408\u771f\u5b9e\u7684\u4e0b\u4e00\u6b21\u5927\u6f6e/\u5c0f\u6f6e\u65f6\u95f4\u70b9\uff0c\u5177\u4f53\u63cf\u8ff0\u8fd9\u4e00\u4e2a\u6708\u7684\u80fd\u91cf\u8282\u594f\u8d70\u5411\u3002", descEn: "A real tide number thirty days out, tied to the actual next spring or neap tide \u2014 the month's real rhythm." },
  { titleZh: "\u672a\u676590\u65e5\u80fd\u91cf\u5468\u671f", titleEn: "The Next 90 Days", descZh: "90\u5929\u540e\u6f6e\u6c50\u5f3a\u5ea6\uff0c\u63cf\u8ff0\u8fd9\u4e2a\u66f4\u957f\u5468\u671f\u91cc\uff0c\u80fd\u91cf\u662f\u5728\u79ef\u84c4\u3001\u91ca\u653e\u8fd8\u662f\u8f6c\u5316\u3002", descEn: "A real tide number ninety days out \u2014 whether this longer cycle is building, releasing, or transforming." },
  { titleZh: "\u7075\u7280\u573a\u4eca\u65e5\u8fde\u63a5", titleEn: "Today's Practice", descZh: "\u4e00\u4e2a\u5177\u4f53\u3001\u53ef\u6267\u884c\u7684\u4eca\u65e5\u5c0f\u7ec3\u4e60\uff0c\u7ed3\u5408\u524d\u9762\u63d0\u5230\u7684\u5177\u4f53\u6f6e\u6c50\u72b6\u6001\uff0c\u4e0d\u662f\"\u6df1\u547c\u5438\"\u8fd9\u79cd\u901a\u7528\u5efa\u8bae\u3002", descEn: "A specific, doable practice for today, tied to your actual tide state \u2014 not \"just breathe.\"" },
  { titleZh: "\u4eca\u65e5\u8fd0\u52bf\u6f6e\u6c50\u603b\u7ed3", titleEn: "Tide Summary", descZh: "\u6536\u5c3e\u5fc5\u987b\u6307\u5411\u524d\u9762\u63d0\u5230\u8fc7\u7684\u5177\u4f53\u6f6e\u6c50\u6570\u5b57\u6216\u5224\u65ad\uff0c\u4e0d\u662f\u9760\u60c5\u7eea\u8bcd\u6536\u5c3e\u3002", descEn: "A closing tied to a specific tide number already discussed \u2014 not a warm-and-fuzzy sendoff." },
];
export default function DailyFlow({faq}:{faq:ReactNode}) {
const en=useLang(); const t=(zh:string,enText:string)=>en?enText:zh;
const [name,setName]=useState("");const [year,setYear]=useState("");const [month,setMonth]=useState("");const [day,setDay]=useState("");
const [hour,setHour]=useState("12");const [minute,setMinute]=useState("0");const [hasTime,setHasTime]=useState(false);const [calendarType,setCalendarType]=useState<CalendarType>("solar");
const [result,setResult]=useState<Awaited<ReturnType<typeof readDailyPreview>>["preview"]>(null);const [calculating,setCalculating]=useState(false);const [unlocking,setUnlocking]=useState(false);const [error,setError]=useState("");
const birth=()=>({year:Number(year),month:Number(month),day:Number(day),hour:hasTime?Number(hour):12,minute:hasTime?Number(minute):0,hasTime,calendarType});
useEffect(()=>{setResult(null)},[year,month,day,hour,minute,hasTime,calendarType]);
const calc=async()=>{if(calculating)return;setCalculating(true);setError("");try{const data=await readDailyPreview(birth());if(data.error)setError(data.error);else setResult(data.preview);}catch{setError(t("读取失败，请稍后再试。","Reading failed. Please try again."));}finally{setCalculating(false)}};
const unlock=async()=>{if(!result||unlocking)return;if(!window.confirm(t("确认解锁完整今日潮汐档案？接下来进入支付页面确认金额。","Unlock the complete Today’s Tide archive? Continue to checkout to confirm the price.")))return;setUnlocking(true);setError("");try{const response=await fetch("/api/daily-tide/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...birth(),name})});const data=await response.json();if(!response.ok||!data.id)throw Error(data.error||t("保存失败，请重试。","Save failed. Please retry."));window.location.href="/checkout?productId=daily-tide-report&submissionId="+data.id+"&name="+encodeURIComponent(name)+"&redirect="+encodeURIComponent("/daily?archive="+data.id);}catch(e){setError(e instanceof Error?e.message:t("连接失败，请重试。","Connection failed. Please retry."));setUnlocking(false)}};
const input=(<div className="lx-glass-wealth p-6 text-center">
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder={t("你的名字（选填）", "Your name (optional)")}
          className="w-full rounded-sm border border-white/15 bg-transparent px-3 py-2 text-center text-sm text-bone outline-none focus:border-amber/60"
        />
        <BirthDateGuidance value={calendarType} onChange={setCalendarType} context="daily" className="mt-5 text-left" />
        <div className="mt-3 flex items-center justify-center gap-2">
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("年", "Y")} className="w-20 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
          <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder={t("月", "M")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
          <input type="number" value={day} onChange={(e) => setDay(e.target.value)} placeholder={t("日", "D")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
        </div>
        <label className="mt-3 flex items-center justify-center gap-2 text-xs text-bone-dim">
          <input type="checkbox" checked={hasTime} onChange={(e) => setHasTime(e.target.checked)} />
          <BirthTimeOptionalCopy />
        </label>
        {hasTime && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <input type="number" value={hour} onChange={(e) => setHour(e.target.value)} placeholder={t("时", "H")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
            <input type="number" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder={t("分", "Min")} className="w-16 rounded-sm border border-white/15 bg-transparent px-2 py-2 text-center text-sm text-bone outline-none focus:border-amber/60" />
          </div>
        )}

        {(
          <button onClick={calc} disabled={calculating} className="mt-6 flex w-full items-center justify-center gap-2 bg-amber py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-lattice disabled:opacity-50">
            {calculating ? <><PortalSpinner /><Bi zh="正在计算…" en="Calculating…" /></> : <Bi zh="开启今日潮汐探索 →" en="Read My Today’s Tide →" />}
          </button>
        )}
        {error && !result && <ErrorWithLoginPrompt error={error} className="mt-3" />}
      </div>);
return <AssessmentWorkbench product="daily" input={input} faq={faq} busy={calculating||unlocking} preview={result?<><DailyPreview data={result}/><div className="mt-6 space-y-5">{TEASER_CHAPTERS.map((c,i)=><article key={c.titleEn}><h3 className="text-lattice">{String(i+1).padStart(2,"0")} · <Bi zh={c.titleZh} en={c.titleEn}/></h3><p className="mt-2 text-sm leading-7 text-bone-dim"><Bi zh={c.descZh} en={c.descEn}/></p></article>)}<button onClick={unlock} disabled={unlocking} className="w-full bg-lattice p-4 text-void-deep"><Bi zh={"展开深度潮汐报告 · ¥"+getProduct("daily-tide-report")?.priceRmb} en="Unlock the complete Today’s Tide archive"/></button>{error&&<ErrorWithLoginPrompt error={error}/>}</div></>:<AssessmentEmpty product="daily"/>}/>;
}
