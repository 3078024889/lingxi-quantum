"use client";
import Link from"next/link";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
import{getTool}from"@/lib/tools/registry";
import{toolTitle}from"@/lib/tools/card-i18n";
import{continueTargets}from"@/lib/tools/platform/continuation";
import{createToolHandoff}from"@/lib/tools/workspace/handoff";
import{loadRecoverableResult}from"@/lib/tools/workspace/recoverable-results";
import{onRecentToolActivityChange,readRecentToolActivity,type RecentToolActivity}from"@/lib/tools/workspace/recent-tools";

type Row=Record<LingxiLang,string>;
const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Row=>({zh,en,ja,ko,fr,de,es,pt,ar});
const COPY={
 title:L("最近工作","Recent work","最近の作業","최근 작업","Travaux récents","Letzte Arbeiten","Trabajo reciente","Trabalho recente","العمل الأخير"),
 lead:L("结果保留在这个设备里；能恢复时可直接继续下一步。","Results stay on this device; when recoverable, continue straight to the next step.","結果はこの端末に残り、復元できる場合はそのまま次の処理へ進めます。","결과는 이 기기에 남으며 복구 가능하면 바로 다음 단계로 이어집니다.","Les résultats restent sur cet appareil ; lorsqu’ils sont récupérables, poursuivez directement l’étape suivante.","Ergebnisse bleiben auf diesem Gerät; wenn sie wiederherstellbar sind, geht es direkt mit dem nächsten Schritt weiter.","Los resultados permanecen en este dispositivo; si se pueden recuperar, continúa directamente con el siguiente paso.","Os resultados ficam neste dispositivo; quando recuperáveis, continue direto para a próxima etapa.","تبقى النتائج على هذا الجهاز، وإذا أمكن استعادتها يمكنك متابعة الخطوة التالية مباشرة."),
 open:L("再次打开","Open again","もう一度開く","다시 열기","Ouvrir à nouveau","Erneut öffnen","Abrir de nuevo","Abrir novamente","فتح مجددًا"),
 resume:L("继续下一步","Continue","次へ進む","계속하기","Continuer","Fortsetzen","Continuar","Continuar","متابعة"),
 restoring:L("正在恢复…","Restoring…","復元中…","복구 중…","Restauration…","Wiederherstellung…","Restaurando…","Restaurando…","جارٍ الاستعادة…"),
 expired:L("结果已过期，请重新处理一次。","This result has expired. Run the tool again.","結果の保存期限が切れました。もう一度処理してください。","결과가 만료되었습니다. 다시 처리해 주세요.","Ce résultat a expiré. Relancez l’outil.","Dieses Ergebnis ist abgelaufen. Bitte erneut ausführen.","Este resultado ha caducado. Ejecuta la herramienta de nuevo.","Este resultado expirou. Execute a ferramenta novamente.","انتهت صلاحية النتيجة. شغّل الأداة مرة أخرى.")
};
function txt(lang:LingxiLang,key:keyof typeof COPY){return COPY[key][lang]||COPY[key].en}
const LOCALE:Record<LingxiLang,string>={zh:"zh-CN",en:"en",ja:"ja",ko:"ko",fr:"fr",de:"de",es:"es",pt:"pt",ar:"ar"};
function age(lang:LingxiLang,at:number){const minutes=Math.max(0,Math.round((Date.now()-at)/60000));const rtf=new Intl.RelativeTimeFormat(LOCALE[lang]||"en",{numeric:"auto"});if(minutes<60)return rtf.format(-minutes,"minute");const hours=Math.round(minutes/60);if(hours<48)return rtf.format(-hours,"hour");return rtf.format(-Math.round(hours/24),"day")}

export default function RecentTools(){
 const{lang}=useLingxiLang();const router=useRouter();const[items,setItems]=useState<RecentToolActivity[]>([]);const[busy,setBusy]=useState<string|null>(null);const[error,setError]=useState<string|null>(null);
 useEffect(()=>{const refresh=()=>setItems(readRecentToolActivity());refresh();return onRecentToolActivityChange(refresh)},[]);
 const rows=items.map(item=>({item,tool:getTool(item.slug)})).filter(x=>x.tool);
 if(!rows.length)return null;
 async function resume(item:RecentToolActivity){
  if(!item.workspaceId){router.push(`/tools/${item.slug}`);return}
  setBusy(item.slug);setError(null);
  try{const recovered=await loadRecoverableResult(item.workspaceId);if(!recovered){setError(item.slug);return}const targets=continueTargets(item.slug,recovered.files);if(!targets.length){router.push(`/tools/${item.slug}`);return}const token=await createToolHandoff(item.slug,recovered.files);router.push(`/tools/${targets[0].slug}?handoff=${encodeURIComponent(token)}`)}catch{setError(item.slug)}finally{setBusy(null)}
 }
 return <section className="mb-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-5" aria-label={txt(lang,"title")}>
  <div><h2 className="text-base font-medium text-[var(--lx-ink)]">{txt(lang,"title")}</h2><p className="mt-1 text-xs leading-5 text-[var(--lx-faint)]">{txt(lang,"lead")}</p></div>
  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
   {rows.map(({item,tool})=><div key={item.slug} className="min-w-[210px] rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3">
    <p className="text-sm font-medium text-[var(--lx-ink)]">{toolTitle(lang,item.slug,lang==="zh"?tool!.titleZh:tool!.titleEn)}</p>
    <p className="mt-1 text-[11px] text-[var(--lx-faint)]">{age(lang,item.at)}</p>
    <div className="mt-3 flex flex-wrap gap-2"><Link href={`/tools/${item.slug}`} className="text-xs text-[var(--lx-muted)] underline-offset-2 hover:underline">{txt(lang,"open")}</Link>{item.workspaceId?<button type="button" disabled={busy!==null} onClick={()=>resume(item)} className="text-xs font-medium text-[var(--lx-ink)] disabled:opacity-50">{busy===item.slug?txt(lang,"restoring"):txt(lang,"resume")}</button>:null}</div>
    {error===item.slug?<p className="mt-2 text-[11px] text-[var(--lx-danger)]">{txt(lang,"expired")}</p>:null}
   </div>)}
  </div>
 </section>;
}
