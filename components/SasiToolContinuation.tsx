"use client";
import Link from"next/link";
import{useEffect,useState}from"react";
import{useLingxiLang}from"@/lib/lingxi-i18n";

type Match={id:string;kind:"tool"|"skill";title:string;score:number};
const COPY={
 zh:"打开对应工具继续",en:"Continue with the matching tool",ja:"対応ツールで続ける",ko:"해당 도구로 계속하기",
 fr:"Continuer avec l’outil adapté",de:"Mit dem passenden Werkzeug fortfahren",es:"Continuar con la herramienta adecuada",
 pt:"Continuar com a ferramenta adequada",ar:"المتابعة باستخدام الأداة المناسبة"
}as const;

export default function SasiToolContinuation({question}:{question:string}){
 const{lang}=useLingxiLang(),[match,setMatch]=useState<Match|null>(null);
 useEffect(()=>{
  let alive=true;const q=question.trim();if(q.length<2){setMatch(null);return}
  void fetch("/api/sasi/capabilities?q="+encodeURIComponent(q),{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{
   if(!alive)return;
   const rows=Array.isArray(data?.matches)?data.matches as Match[]:[];
   const tool=rows.find(x=>x.kind==="tool"&&Number(x.score)>=5);
   setMatch(tool||null);
  }).catch(()=>{if(alive)setMatch(null)});
  return()=>{alive=false};
 },[question]);
 if(!match)return null;
 return <Link data-testid="sasi-tool-continuation" href={"/tools/"+encodeURIComponent(match.id)} className="mt-3 inline-flex rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm text-[var(--lx-ink)] hover:bg-[var(--lx-soft)]">{COPY[lang]||COPY.en} →</Link>;
}
