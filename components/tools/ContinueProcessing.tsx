"use client";
import{useState}from"react";
import{useRouter}from"next/navigation";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import type{ToolResultFile}from"@/lib/tools/types";
import{continueTargets}from"@/lib/tools/platform/continuation";
import{continuationText}from"@/lib/tools/platform/continuation-i18n";
import{createToolHandoff}from"@/lib/tools/workspace/handoff";

export default function ContinueProcessing({sourceSlug,files}:{sourceSlug:string;files:ToolResultFile[]}){
 const{lang}=useLingxiLang();const router=useRouter();const[busy,setBusy]=useState<string|null>(null);const[error,setError]=useState<string|null>(null);
 const targets=continueTargets(sourceSlug,files);if(!targets.length)return null;
 async function go(slug:string){setBusy(slug);setError(null);try{const token=await createToolHandoff(sourceSlug,files);router.push(`/tools/${slug}?handoff=${encodeURIComponent(token)}`)}catch{setError(continuationText(lang,"error"))}finally{setBusy(null)}}
 return <section className="mt-6 border-t border-[var(--lx-line)] pt-5" data-testid="continue-processing">
  <div><p className="text-sm font-medium text-[var(--lx-ink)]">{continuationText(lang,"title")}</p><p className="mt-1 text-xs leading-5 text-[var(--lx-faint)]">{continuationText(lang,"lead")}</p></div>
  <div className="mt-3 flex flex-wrap gap-2">{targets.map(target=><button key={target.slug} type="button" disabled={busy!==null} onClick={()=>go(target.slug)} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2.5 text-sm text-[var(--lx-ink)] transition hover:border-[var(--lx-line-strong)] disabled:opacity-50">{busy===target.slug?continuationText(lang,"busy"):continuationText(lang,target.copyKey)}</button>)}</div>
  {error&&<p role="alert" className="mt-3 text-sm text-[var(--lx-danger)]">{error}</p>}
 </section>;
}
