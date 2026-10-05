"use client";

import type{ReactNode}from"react";
import{SasiUserMessage}from"@/components/SasiComposerCore";
import type{SasiConversationTurn}from"@/lib/sasi/core/session-contract";

export function SasiAssistantText({children,className=""}:{children:ReactNode;className?:string}){
 return <article data-sasi-role="assistant" data-sasi-result-kind="text" className={`max-w-3xl whitespace-pre-wrap text-[15px] leading-8 text-[var(--lx-ink)] ${className}`}>{children}</article>;
}

export function SasiConversationTurns({turns}:{turns:SasiConversationTurn[]}){
 return <>{turns.map(turn=><div key={turn.id} className="mb-10" data-sasi-turn-id={turn.id}>
  <SasiUserMessage className="mb-6">{turn.user}</SasiUserMessage>
  <SasiAssistantText>{turn.assistant}</SasiAssistantText>
 </div>)}</>;
}

export function SasiVideoResult({url,downloadLabel}:{url:string;downloadLabel:string}){
 return <div className="mb-8" data-sasi-result-kind="video">
  <video src={url} controls playsInline className="max-h-[68vh] w-full rounded-3xl bg-black"/>
  <a href={url} download className="mt-3 inline-block rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{downloadLabel}</a>
 </div>;
}

export function SasiWebsiteResult({
 html,title,downloadLabel,onDownload
}:{html:string;title:string;downloadLabel:string;onDownload:()=>void}){
 return <div className="mb-8 space-y-3" data-sasi-result-kind="website">
  <iframe title={title} sandbox="" referrerPolicy="no-referrer" className="h-[620px] w-full rounded-3xl border border-[var(--lx-line)] bg-white" srcDoc={html}/>
  <button type="button" onClick={onDownload} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">{downloadLabel}</button>
 </div>;
}

export function SasiStatusLine({children}:{children:ReactNode}){
 if(!children)return null;
 return <p role="status" className="px-3 pt-2 text-[11px] leading-5 text-[var(--lx-muted)]">{children}</p>;
}
