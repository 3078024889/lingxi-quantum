"use client";
import Link from"next/link";
import{useEffect,useState}from"react";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
import{getTool}from"@/lib/tools/registry";
import{toolTitle}from"@/lib/tools/card-i18n";
import{onRecentToolActivityChange,readRecentToolActivity,type RecentToolActivity}from"@/lib/tools/workspace/recent-tools";

type Row=Record<LingxiLang,string>;
const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Row=>({zh,en,ja,ko,fr,de,es,pt,ar});
const COPY={
 title:L("最近完成","Recently finished","最近完了","최근 완료","Récemment terminés","Kürzlich abgeschlossen","Terminados recientemente","Concluídos recentemente","المكتمل مؤخرًا"),
 lead:L("回到刚才用过的工具，不用重新寻找入口。","Return to tools you just used without searching again.","さっき使ったツールへすぐ戻れます。","방금 사용한 도구로 바로 돌아갈 수 있습니다.","Revenez directement aux outils que vous venez d’utiliser.","Kehre direkt zu den zuletzt verwendeten Werkzeugen zurück.","Vuelve directamente a las herramientas que acabas de usar.","Volte diretamente às ferramentas que acabou de usar.","ارجع مباشرة إلى الأدوات التي استخدمتها للتو."),
 open:L("再次打开","Open again","もう一度開く","다시 열기","Ouvrir à nouveau","Erneut öffnen","Abrir de nuevo","Abrir novamente","فتح مجددًا")
};
function txt(lang:LingxiLang,key:keyof typeof COPY){return COPY[key][lang]||COPY[key].en}
const LOCALE:Record<LingxiLang,string>={zh:"zh-CN",en:"en",ja:"ja",ko:"ko",fr:"fr",de:"de",es:"es",pt:"pt",ar:"ar"};
function age(lang:LingxiLang,at:number){
 const minutes=Math.max(0,Math.round((Date.now()-at)/60000));
 const rtf=new Intl.RelativeTimeFormat(LOCALE[lang]||"en",{numeric:"auto"});
 if(minutes<60)return rtf.format(-minutes,"minute");
 const hours=Math.round(minutes/60);if(hours<48)return rtf.format(-hours,"hour");
 return rtf.format(-Math.round(hours/24),"day");
}

export default function RecentTools(){
 const{lang}=useLingxiLang();const[items,setItems]=useState<RecentToolActivity[]>([]);
 useEffect(()=>{const refresh=()=>setItems(readRecentToolActivity());refresh();return onRecentToolActivityChange(refresh)},[]);
 const rows=items.map(item=>({item,tool:getTool(item.slug)})).filter(x=>x.tool);
 if(!rows.length)return null;
 return <section className="mb-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-5" aria-label={txt(lang,"title")}>
  <div><h2 className="text-base font-medium text-[var(--lx-ink)]">{txt(lang,"title")}</h2><p className="mt-1 text-xs leading-5 text-[var(--lx-faint)]">{txt(lang,"lead")}</p></div>
  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
   {rows.map(({item,tool})=><Link key={item.slug} href={`/tools/${item.slug}`} className="min-w-[190px] rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 transition hover:border-[var(--lx-line-strong)]">
    <p className="text-sm font-medium text-[var(--lx-ink)]">{toolTitle(lang,item.slug,lang==="zh"?tool!.titleZh:tool!.titleEn)}</p>
    <p className="mt-1 text-[11px] text-[var(--lx-faint)]">{age(lang,item.at)} · {txt(lang,"open")}</p>
   </Link>)}
  </div>
 </section>;
}
