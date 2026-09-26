"use client";

import {useEffect,useMemo,useState} from "react";
import {usePathname} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";

type Price={
  tool_id:string;
  unit_name:string;
  amount_rmb:number;
  amount_usd:number;
  currency:"CNY"|"USD";
  display_amount:number;
  available:boolean;
};

const PAID=new Set([
  "audio-transcription","batch-image-watermark-remover","burn-after-read-file",
  "e-sign-pdf","food-calorie","id-photo-ai","image-watermark-remover","pdf-editor",
  "subtitle-translate","temp-mail-batch","video-dubbing","video-transcription",
  "video-watermark-remover",
]);

function unitLabel(unit:string,zh:boolean){
  if(!zh){
    if(unit==="calculation")return "calculation";
    if(unit==="image")return "image";
    if(unit==="minute")return "minute";
    if(unit==="page")return "page";
    if(unit==="file")return "file";
    if(unit==="email")return "email";
    if(unit==="mb")return "MB";
    return unit||"use";
  }
  if(unit==="calculation")return "次";
  if(unit==="image")return "张";
  if(unit==="minute")return "分钟";
  if(unit==="page")return "页";
  if(unit==="file")return "个文件";
  if(unit==="email")return "个邮箱";
  if(unit==="mb")return "MB";
  return "次";
}

export default function ToolPriceHint(){
  const pathname=usePathname()||"";
  const slug=useMemo(()=>{
    const m=pathname.match(/^\/tools\/([^/?#]+)/);
    return m?.[1]||"";
  },[pathname]);
  const{lang}=useLingxiLang();
  const{currency}=usePreferredCurrency();
  const[price,setPrice]=useState<Price|null>(null);

  useEffect(()=>{
    if(!slug||!PAID.has(slug)){setPrice(null);return}
    let alive=true;
    fetch(`/api/tools/pricing?toolId=${encodeURIComponent(slug)}&currency=${encodeURIComponent(currency)}`,{cache:"no-store"})
      .then(async r=>r.ok?r.json():null)
      .then(d=>{if(alive)setPrice(d)})
      .catch(()=>{if(alive)setPrice(null)});
    return()=>{alive=false};
  },[slug,currency]);

  if(!price)return null;

  const zh=lang==="zh";
  const amount=price.currency==="CNY"
    ? `¥${Number(price.display_amount).toFixed(2)}`
    : `$${Number(price.display_amount).toFixed(2)} USD`;

  return <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
    <span className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-1.5 text-[var(--lx-ink)]">
      {zh?"参考价格":"Price"} · <b>{amount}</b> / {unitLabel(price.unit_name,zh)}
    </span>
    {!price.available&&
      <span className="text-[var(--lx-muted)]">{zh?"当前暂不可处理":"Temporarily unavailable"}</span>}
  </div>;
}
