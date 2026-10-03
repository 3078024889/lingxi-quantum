import fs from "node:fs";
import {execFileSync} from "node:child_process";

const EXPECTED="58f29895e2a5813c787b0e255a76843c209064de";
const FILE="components/KnowledgeWorkspace.tsx";

const head=execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
if(head!==EXPECTED)throw new Error(`R10_HEAD_MISMATCH:${head}`);

let s=execFileSync("git",["show",`${EXPECTED}:${FILE}`],{
  encoding:"utf8",
  maxBuffer:8*1024*1024
});
if(!s.includes("export default function KnowledgeWorkspace"))throw new Error("R10_BASELINE_FETCH_FAILED");

function must(oldText,newText,label){
  if(!s.includes(oldText))throw new Error(`R10_MARKER_MISSING:${label}`);
  s=s.replace(oldText,newText);
}
function between(start,end,replacement,label){
  const a=s.indexOf(start);
  const b=a>=0?s.indexOf(end,a+start.length):-1;
  if(a<0||b<0)throw new Error(`R10_RANGE_MISSING:${label}`);
  // Every replacement below already includes the boundary represented by `end`.
  // Consume the original end marker so it is not duplicated in the rebuilt TSX.
  s=s.slice(0,a)+replacement+s.slice(b+end.length);
}

// Imports and shared contracts.
must(
  'import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";',
  'import { useEffect, useRef, useState, type ReactNode } from "react";',
  "react-import"
);
s=s.replace('import {transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";\n',"");
must(
  'import { KNOWLEDGE_SOURCE_MAX } from "@/lib/ai-knowledge/local-index";',
  'import { KNOWLEDGE_SOURCE_MAX } from "@/lib/ai-knowledge/local-index";\nimport{SASI_UNIFIED_ACCEPT}from"@/lib/sasi/composer-core";\nimport{downloadSasiDocx}from"@/lib/sasi/export-docx";',
  "shared-imports"
);
s=s.replace(/const SASI_UNIFIED_ACCEPT=\[[\s\S]*?\]\.join\(","\);\s*/m,"");

// Remove retired paste-library translation entries without deleting sibling
// properties that happen to share the same physical line (for example copyAll).
for(const key of["needTitle","saved","draftTitle","draftReady","paste","sourceName","pastePlaceholder","addLibrary"]){
  const rx=new RegExp(`(^|\\n)\\s*${key}:c\\([\\s\\S]*?\\),\\s*`,"m");
  s=s.replace(rx,(match,prefix)=>prefix||"");
}

// Remove state that powered the old paste panel/live query.
for(const line of[
  '  const [title,setTitle]=useState("");\n',
  '  const [text,setText]=useState("");\n',
  '  const [query,setQuery]=useState("");\n',
  '  const [pasteOpen,setPasteOpen]=useState(false);\n'
]) s=s.replace(line,"");

must(
  '  const [addOpen,setAddOpen]=useState(false);\n',
  '  const [addOpen,setAddOpen]=useState(false);\n  const [dragging,setDragging]=useState(false);\n  const [needsConnection,setNeedsConnection]=useState(false);\n',
  "composer-state"
);

// Remove synchronous search-on-keystroke and old paste-library save flow.
between(
  '  const activeQuery=(query||question).trim();',
  '  async function importOneFile(file:File){',
  '  async function importOneFile(file:File){',
  "live-search"
);

// Remove local OCR helper. Media is attached instantly; intelligence can process it later.
between(
  'async function imageToText(file:File):Promise<string>{',
  'export default function KnowledgeWorkspace',
  'export default function KnowledgeWorkspace',
  "image-ocr-helper"
);

// Replace image/audio/video processing with instant attachment.
between(
  '    }else if(file.type.startsWith("image/")){',
  '    }else if(/\\.zip$/i.test(file.name)||file.type==="application/zip"){',
  `    }else if(file.type.startsWith("image/")){
      kind="image";
      parsedText="";
    }else if(/\\.(mp3|wav|m4a|mp4|mov|webm)$/i.test(file.name)||file.type.startsWith("audio/")||file.type.startsWith("video/")){
      parsedText="";
      kind="text";
    }else if(/\\.zip$/i.test(file.name)||file.type==="application/zip"){`,
  "media-fast-attach"
);

must(
  '    const ok:string[]=[];const failed:string[]=[];',
  '    const ok:string[]=[];const failed:string[]=[];let mediaWithoutText=0;',
  "media-counter"
);
must(
  '          const source = await importOneFile(file);\n          ok.push(source.title);',
  '          const source = await importOneFile(file);\n          ok.push(source.title);\n          if(!source.text.trim())mediaWithoutText++;',
  "media-count"
);
must(
`    }finally{
      setBusy(false);
    }
  }

  async function ask(){`,
`    }finally{
      setBusy(false);
    }
    if(mediaWithoutText>0){
      setNeedsConnection(true);
      setNotice(lang==="zh"
        ?"媒体已加入。需要理解图片、音频或视频内容时，请连接支持相应能力的智能服务。"
        :"Media added. Connect an intelligence service with the required image/audio/video capability to understand it.");
    }
  }

  async function ask(){`,
  "media-notice"
);

// Defer knowledge search until Send; direct long paste becomes temporary evidence.
between(
  '  async function ask(){',
  '  async function sendFeedback(signal:FeedbackSignal){',
`  async function ask(){
    const raw=question.trim();if(!raw)return;
    setNeedsConnection(false);

    const textSources=sources.filter(source=>source.text.trim().length>0);
    const largeDirectPaste=raw.length>=800||(raw.length>=300&&(raw.includes("\\n")||raw.includes("\\r")));
    let evidence=largeDirectPaste?[]:searchKnowledge(textSources,raw.length>4000?raw.slice(-4000):raw);
    let apiQuestion=raw.slice(0,4000);

    if(largeDirectPaste){
      const chunks=Array.from({length:Math.min(9,Math.ceil(raw.length/8000))},(_,index)=>raw.slice(index*8000,(index+1)*8000));
      evidence=chunks.map((chunk,index)=>({
        sourceId:"__direct_paste__",
        title:lang==="zh"?"当前粘贴内容":"Current pasted content",
        paragraph:index+1,
        locator:lang==="zh"?\`粘贴内容 \${index+1}\`:\`Pasted content \${index+1}\`,
        text:chunk,
        score:100-index,
      }));
      apiQuestion=lang==="zh"
        ?"请根据我刚刚直接粘贴的内容进行理解、提炼，并优先完成其中明确提出的要求。"
        :"Use the content I just pasted as the source. Understand it, extract the key information, and prioritize any explicit request contained in it.";
    }

    if(!evidence.length){
      setNeedsConnection(true);
      const hasMedia=sources.some(source=>!source.text.trim());
      setNotice(lang==="zh"
        ?(hasMedia
          ?"媒体已加入，但当前没有可检索文字。请连接支持相应媒体能力的智能服务，或继续加入文字资料。"
          :"当前没有找到相关原文。可直接粘贴较长资料，或连接我的智能服务。")
        :(hasMedia
          ?"Media is attached but has no searchable text. Connect a media-capable intelligence service or add text-based material."
          :"No relevant source text was found. Paste source text directly or connect your intelligence service."));
      return;
    }

    setAskBusy(true);setAnswer("");setLearningEventId("");setFeedbackSignal(null);setFeedbackNotice("");setLastIntelligence(null);setNotice(tr(lang,"sending"));
    try{
      const response=await fetch("/api/knowledge/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        question:apiQuestion,mode,intelligence,useConnectedService,evidence:evidence.map((r,i)=>({index:i+1,title:r.title,locator:r.locator,text:r.text}))
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||tr(lang,"aiFailed"));
      setAnswer(data.answer||"");
      setThread(rows=>[...rows,{question:raw,answer:String(data.answer||"")}]);
      setLearningEventId(String(data.learningEventId||""));
      setLastIntelligence((data.intelligence||intelligence) as Intelligence);
      setNotice(tr(lang,"done"));
      setQuestion("");
    }catch(e:unknown){
      const message=e instanceof Error?e.message:tr(lang,"aiFailed");
      setNotice(message);
    }finally{setAskBusy(false)}
  }

  async function sendFeedback(signal:FeedbackSignal){`,
  "ask"
);

// Real DOCX export.
between(
  '  function downloadThreadDoc(){',
  '  async function downloadThreadZip(){',
`  async function downloadThreadDoc(){
    const rows=thread.length?thread:(answer?[{question,answer}]:[]);
    await downloadSasiDocx(rows,"sasi-discussion.docx");
  }
  async function downloadThreadZip(){`,
  "docx"
);

// Blue user messages.
s=s.replace(
  'className="ml-auto mb-6 max-w-[78%] rounded-3xl bg-[var(--lx-soft)] px-5 py-3 text-sm leading-7 text-blue-600"',
  'className="ml-auto mb-6 max-w-[78%] rounded-3xl border border-blue-100 bg-blue-50/70 px-5 py-3 text-sm font-medium leading-7 text-blue-600 shadow-sm"'
);

// Media chip.
s=s.replace(
  '<span className="truncate">{source.title}</span>',
  '<span className="truncate">{source.title}</span>{!source.text.trim()&&<span className="shrink-0 text-[10px] text-blue-600">{lang==="zh"?"待理解":"Needs intelligence"}</span>}'
);

// Remove paste panel.
between(
  '      {pasteOpen&&<div',
  '      <div className="relative rounded-[28px]',
  '      <div className="relative rounded-[28px]',
  "paste-panel"
);

// Main composer = drop zone.
must(
  '      <div className="relative rounded-[28px] border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3 shadow-[0_12px_44px_rgba(0,0,0,.10)]">',
`      <div
        onDragEnter={e=>{e.preventDefault();setDragging(true)}}
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={e=>{if(e.currentTarget===e.target)setDragging(false)}}
        onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files?.length)void importFiles(e.dataTransfer.files)}}
        className={\`relative rounded-[30px] border bg-[var(--lx-panel)] p-4 shadow-[0_20px_70px_rgba(99,102,241,.12)] transition sm:p-5 \${dragging?"border-blue-300 ring-4 ring-blue-100/70":"border-[var(--lx-line)]"}\`}>`,
  "drop-zone"
);

// Direct text paste stays native; pasted files are accepted.
must(
  '        <textarea value={question} onChange={e=>{setQuestion(e.target.value);setQuery(e.target.value)}} rows={1}',
`        <textarea value={question}
          onChange={e=>setQuestion(e.target.value)}
          onPaste={e=>{
            const files=Array.from(e.clipboardData.files||[]);
            if(files.length){e.preventDefault();void importFiles(files)}
          }}
          rows={1}`,
  "textarea"
);
s=s.replace(
  'className="max-h-56 min-h-14 w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-7 text-blue-600 outline-none placeholder:text-[var(--lx-faint)]"',
  'className="max-h-72 min-h-20 w-full resize-none bg-transparent px-3 py-3 text-[15px] font-medium leading-7 text-blue-600 outline-none placeholder:font-normal placeholder:text-[var(--lx-faint)]"'
);

// Remove the legacy paste button.
const oldPasteButton='              <button type="button" onClick={()=>{setAddOpen(false);setPasteOpen(v=>!v)}} className="block w-full rounded-xl px-3 py-3 text-left text-sm hover:bg-[var(--lx-soft)]">{lang==="zh"?"粘贴资料":"Paste source text"}</button>\n';
if(!s.includes(oldPasteButton))throw new Error("R10_MARKER_MISSING:paste-button");
s=s.replace(oldPasteButton,"");

// Direct pasted text can be sent without indexed sources.
s=s.replace('disabled={askBusy||!question.trim()||!hasQueryableSources}','disabled={askBusy||!question.trim()}');

// Connection CTA for unattached intelligence capability.
must(
  '{notice&&<p role="status" className="px-3 pt-2 text-[11px] leading-5 text-[var(--lx-muted)]">{notice}</p>}',
`{notice&&<div className="flex flex-wrap items-center gap-2 px-3 pt-2 text-[11px] leading-5 text-[var(--lx-muted)]">
          <p role="status">{notice}</p>
          {needsConnection&&<Link href="/sasi/connections" className="font-medium text-blue-600 hover:underline">{lang==="zh"?"连接我的智能服务 →":"Connect my intelligence service →"}</Link>}
        </div>}`,
  "notice"
);

for(const forbidden of["pasteOpen","setPasteOpen","setQuery(","activeQuery","searchableSources","hasQueryableSources","transcribeLocal"]){
  if(s.includes(forbidden))throw new Error(`R10_FORBIDDEN_REMAINS:${forbidden}`);
}
if(!s.includes('copyAll:c('))throw new Error("R14_COPYALL_TRANSLATION_MISSING");
if(!s.includes('copied:c('))throw new Error("R14_COPIED_TRANSLATION_MISSING");
if(!s.includes("onDrop={e=>"))throw new Error("R10_DROP_MISSING");
if(!s.includes("e.clipboardData.files"))throw new Error("R10_CLIPBOARD_MISSING");
if(!s.includes("downloadSasiDocx"))throw new Error("R10_DOCX_MISSING");

fs.writeFileSync(FILE,s,"utf8");
console.log("R14_KNOWLEDGE_BASELINE_REBUILD=PASS");
