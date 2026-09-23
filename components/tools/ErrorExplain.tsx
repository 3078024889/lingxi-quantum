"use client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolRuntimeText} from "@/lib/tool-runtime-i18n";
export default function ErrorExplain({reasonZh,reasonEn,hintZh,hintEn}:{reasonZh:string;reasonEn:string;hintZh?:string;hintEn?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 return <div className="mt-6 rounded-sm border border-rose/30 bg-rose/5 p-5"><p className="text-sm uppercase tracking-widest2 text-rose">{t("未能完成","Could not finish")}</p><p className="mt-2 text-base text-bone">{t(reasonZh,reasonEn)}</p>{(hintZh||hintEn)&&<p className="mt-2 text-sm leading-6 text-bone-dim">{t(hintZh||"",hintEn||hintZh||"")}</p>}</div>;
}
