"use client";

import type{ReactNode}from"react";
import {Fragment} from "react";
import{SasiUserMessage}from"@/components/SasiComposerCore";
import type{SasiConversationTurn}from"@/lib/sasi/core/session-contract";

/** Render common Markdown without interpreting untrusted HTML. */
function inlineText(source:string){
 const parts=source.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g);
 return parts.map((part,i)=>part.startsWith("**")&&part.endsWith("**")
   ? <strong key={i}>{part.slice(2,-2)}</strong>
   : part.startsWith("`")&&part.endsWith("`")
   ? <code key={i} className="rounded bg-[var(--lx-soft)] px-1">{part.slice(1,-1)}</code>
   : <Fragment key={i}>{part}</Fragment>);
}
function assistantMarkdown(value:string){
 const lines=value.replace(/\r\n?/g,"\n").split("\n");
 const blocks:ReactNode[]=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(/^\s*```/.test(line)){
   const language=line.trim().slice(3).replace(/[^a-zA-Z0-9+#-]/g,"").slice(0,24);
   const code:string[]=[];
   while(i+1<lines.length&&!/^\s*```/.test(lines[i+1]))code.push(lines[++i]);
   if(i+1<lines.length)i++;
   blocks.push(<pre key={i} className="my-3 overflow-x-auto rounded-xl bg-[var(--lx-soft)] p-3 text-sm leading-6"><code data-language={language}>{code.join("\n")}</code></pre>);
   continue;
  }
  if(/^\s*(---|\*\*\*)\s*$/.test(line)){blocks.push(<hr key={i} className="my-4 border-[var(--lx-line)]"/>);continue}
  const heading=/^(#{1,3})\s+(.+)$/.exec(line);
  if(heading){blocks.push(<p key={i} className="mt-4 mb-1 font-semibold">{inlineText(heading[2])}</p>);continue}
  const bullet=/^\s*[-*]\s+(.+)$/.exec(line);
  if(bullet){blocks.push(<p key={i} className="pl-4 before:content-['•'] before:mr-2">{inlineText(bullet[1])}</p>);continue}
  const ordered=/^\s*(\d+)\.\s+(.+)$/.exec(line);
  if(ordered){blocks.push(<p key={i} className="pl-4">{ordered[1]}. {inlineText(ordered[2])}</p>);continue}
  blocks.push(<p key={i} className={line?"":"h-4"}>{inlineText(line)}</p>);
 }
 return blocks;
}

export function SasiAssistantText({children,className=""}:{children:ReactNode;className?:string}){
 return <article data-sasi-role="assistant" data-sasi-result-kind="text" className={`max-w-3xl text-[15px] leading-8 text-[var(--lx-ink)] ${className}`}>
  {typeof children==="string"?assistantMarkdown(children):children}
 </article>;
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
