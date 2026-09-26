#!/usr/bin/env node
import {spawnSync} from "node:child_process";import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const commands=[
 ["qpdf",process.env.LINGXI_QPDF_BIN||"qpdf",["--version"]],
 ["pdfcpu",process.env.LINGXI_PDFCPU_BIN||"pdfcpu",["version"]],
 ["ffmpeg",process.env.LINGXI_FFMPEG_BIN||"ffmpeg",["-version"]],
 ["whispercpp",process.env.LINGXI_WHISPER_BIN||"whisper-cli",["--help"]],
 ["exiftool",process.env.LINGXI_EXIFTOOL_BIN||"exiftool",["-ver"]],
 ["opencc",process.env.LINGXI_OPENCC_BIN||"opencc",["--version"]],
];
const modules=["paddleocr","cv2","mediapipe","faster_whisper","argostranslate","kokoro","jieba"];
const nodeModules=["sharp","mammoth","exceljs","@mozilla/readability","jsdom","dompurify","turndown"];
const out={checkedAt:new Date().toISOString(),commands:{},python:{},node:{}};
for(const [id,bin,args] of commands){const r=spawnSync(bin,args,{encoding:"utf8",windowsHide:true,timeout:8000});out.commands[id]={available:!r.error&&(r.status===0||r.status===1),version:(r.stdout||r.stderr||"").split(/\r?\n/).find(Boolean)?.trim()?.slice(0,180)||null,error:r.error?.message||null};}
const py=process.env.LINGXI_PYTHON_BIN||"python";
for(const mod of modules){const r=spawnSync(py,["-c",`import ${mod}; print(getattr(${mod}, '__version__', 'installed'))`],{encoding:"utf8",windowsHide:true,timeout:8000});out.python[mod]={available:r.status===0,version:(r.stdout||"").trim().split(/\r?\n/)[0]||null,error:r.status===0?null:(r.stderr||r.error?.message||"not installed").trim().slice(0,240)};}
for(const mod of nodeModules){try{const resolved=require.resolve(mod,{paths:[process.cwd()]});out.node[mod]={available:true,resolved}}catch(e){out.node[mod]={available:false,error:e instanceof Error?e.message:String(e)}}}
console.log(JSON.stringify(out,null,2));
