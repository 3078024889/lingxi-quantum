"use client";
import { useState } from "react";
import { transformText } from "@/lib/tools/shared/text";
export default function TextWorkbench({ slug }: { slug: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [reverse, setReverse] = useState(false);
  const [notice, setNotice] = useState("");
  const encoding = slug.endsWith("encode-decode");
  function run() {
    try { setOutput(transformText(slug, input, reverse)); setNotice("处理完成，原始输入仍保留。"); }
    catch { setOutput(""); setNotice("无法处理：请检查编码是否完整、Base64是否为UTF-8文本，以及输入是否超过50万字符。"); }
  }
  return <div className="space-y-5">
    <p className="text-sm leading-7">在浏览器本地处理，不上传文本。{encoding ? "编码不等于加密；解码内容仅显示为文本，不会执行。" : "处理后先核对结果，再复制使用。"}</p>
    <label className="block">输入文本<textarea className="mt-2 min-h-48 w-full rounded-xl border bg-transparent p-4" value={input} maxLength={500001} onChange={event => { setInput(event.target.value); setOutput(""); setNotice(""); }} /></label>
    {encoding && <label className="block">处理方向<select className="ml-3 rounded-lg border bg-transparent p-2" value={reverse ? "decode" : "encode"} onChange={event => { setReverse(event.target.value === "decode"); setOutput(""); }}><option value="encode">编码</option><option value="decode">解码</option></select></label>}
    <button className="rounded-xl border px-5 py-3" onClick={run}>开始处理</button>
    <label className="block">处理结果<textarea className="mt-2 min-h-40 w-full rounded-xl border bg-transparent p-4" value={output} readOnly /></label>
    <button className="rounded-xl border px-5 py-3 disabled:opacity-50" disabled={!output} onClick={async () => { try { await navigator.clipboard.writeText(output); setNotice("已复制结果。"); } catch { setNotice("浏览器未允许复制，可选中结果手动复制。"); } }}>复制结果</button>
    <p role="status">{notice}</p>
  </div>;
}
