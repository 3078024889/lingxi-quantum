import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {resolvePublicSearchIntent} from "../lib/marketing/public-intent-router.mjs";

const read = rel => readFileSync(new URL("../"+rel,import.meta.url),"utf8");

test("directly routes task-specific Chinese search queries to public tools",()=>{
  const cases = new Map([
    ["PDF文件太大怎么压缩？","/tools/pdf-compress"],
    ["多个PDF怎么合并成一个？","/tools/merge-pdf"],
    ["PDF怎么拆分","/tools/pdf-merge-split"],
    ["PDF转Word","/tools/pdf-to-word"],
    ["PDF转Excel","/tools/pdf-to-xlsx"],
    ["图片压缩到100KB","/tools/compress-image-to-100kb"],
    ["图片压缩到20kb","/tools/compress-image-to-20kb"],
    ["图片转文字 OCR","/tools/ocr"],
    ["图片文字怎么识别","/tools/ocr"],
    ["HEIC转JPG","/tools/heic-to-jpg"],
    ["临时邮箱","/tools/temp-mail"],
    ["阅后即焚","/tools/burn-after-read"],
    ["视频转文字","/tools/video-transcription"],
    ["录音转文字","/tools/audio-transcription"],
    ["全球AI排行榜","/siai"],
    ["AI工具免费额度哪个好","/siai"],
    ["我想制作短剧","/sasi"]
  ]);
  for(const [query,expected] of cases) assert.equal(resolvePublicSearchIntent(query),expected,query);
});

test("multilingual search routing keeps language-independent canonical paths",()=>{
  for(const q of [
    "Compress PDF","compresser PDF","PDF komprimieren","comprimir pdf",
    "PDF 圧縮","PDF 압축","ضغط PDF"
  ]) assert.equal(resolvePublicSearchIntent(q),"/tools/pdf-compress",q);
  for(const q of ["temporary email","捨てメアド","correo temporal","email temporário","بريد مؤقت"])
    assert.equal(resolvePublicSearchIntent(q),"/tools/temp-mail",q);
});

test("privacy and injection: direct paths are fixed, never append free text or private data",()=>{
  const input="PDF压缩?utm_source=bad&utm_campaign=leak#secret";
  assert.equal(resolvePublicSearchIntent(input),"/tools/pdf-compress");
  assert.equal(resolvePublicSearchIntent("我家地址是私人信息"),null);
  assert.equal(resolvePublicSearchIntent("请帮忙做个没有关键词的任务"),null);
  assert.equal(resolvePublicSearchIntent("x".repeat(241)),null);
  for(const q of ["PDF压缩","全球SIAI排行榜","图片压缩到500kb","HEIC to JPG"]){
    const route=resolvePublicSearchIntent(q);
    assert.match(route,/^\/(tools\/[a-z0-9-]+|siai|sasi)$/);
    assert(!route.includes("?")&&!route.includes("#"),q);
  }
});

test("homepage retains SASI handoff and removes directory detours for high-intent tasks",()=>{
  const home=read("components/HomeProblemHub.tsx");
  const faq=read("components/HomeSeoAnswers.tsx");
  assert.match(home,/resolvePublicSearchIntent\(v\)/);
  assert.match(home,/direct&&direct!=="\/sasi"/);
  assert.match(home,/if\(url\.pathname\.startsWith\("\/sasi"\)\)/);
  for(const href of ["/tools/pdf-merge-split","/tools/ocr","/tools/pdf-compress","/tools/temp-mail"])
    assert(faq.includes('href:"'+href+'"'),"missing deep link "+href);
  // Compare pages remain evidence-based; no invented prices or rankings.
  assert(faq.includes('href:"/siai"'));
});
