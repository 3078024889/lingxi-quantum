"use client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolRuntimeText} from "@/lib/tool-runtime-i18n";

export default function ErrorExplain({reasonZh,reasonEn,hintZh,hintEn}:{reasonZh:string;reasonEn:string;hintZh?:string;hintEn?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 return <div className="mt-6 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-5">
  <p className="text-sm font-medium text-[var(--lx-danger)]">{t("这次没有完成","Could not finish this time")}</p>
  <p className="mt-2 text-base text-[var(--lx-ink)]">{t(reasonZh,reasonEn)}</p>
  {(hintZh||hintEn)&&<p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{t(hintZh||"",hintEn||hintZh||"")}</p>}
 </div>;
}
