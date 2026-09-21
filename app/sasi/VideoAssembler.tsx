"use client";
import { useEffect, useRef, useState } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

export default function VideoAssembler() {
  const [files, setFiles] = useState<File[]>([]);
  const [ratio, setRatio] = useState("9:16");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [output, setOutput] = useState("");
  const engine = useRef<FFmpeg | null>(null);
  const active = useRef(false);
  const cancel = useRef(false);
  useEffect(() => () => { cancel.current = true; engine.current?.terminate(); }, []);
  useEffect(() => () => { if (output) URL.revokeObjectURL(output); }, [output]);

  function choose(input: FileList | null) {
    const selected = Array.from(input ?? []);
    if (selected.some(file => !/\.(mp4|mov|webm)$/i.test(file.name)) || selected.length > 24 || selected.reduce((n, f) => n + f.size, 0) > 150 * 1024 * 1024) {
      setMessage("请选择 MP4、MOV 或 WebM；最多 24 段，合计 150MB。大项目需要云端合成，当前暂未开放。"); return;
    }
    setFiles(selected); setOutput(""); setMessage("");
  }
  function move(index: number, step: number) {
    setFiles(previous => { const result = [...previous]; [result[index], result[index + step]] = [result[index + step], result[index]]; return result; });
    setOutput("");
  }
  async function assemble() {
    if (active.current || files.length < 2) return;
    active.current = true; cancel.current = false; setBusy(true); setOutput("");
    try {
      setMessage("首次加载剪辑引擎，约 32MB；视频会留在本机。");
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      if (cancel.current) throw new Error("CANCELLED");
      const ffmpeg = new FFmpeg(); engine.current = ffmpeg;
      let lastMediaLog = "";
      ffmpeg.on("log", ({ message }) => { lastMediaLog = message; });
      await ffmpeg.load({ coreURL: "/media/ffmpeg-0.12.10/ffmpeg-core.js", wasmURL: "/media/ffmpeg-0.12.10/ffmpeg-core.wasm" });
      const [width, height] = ratio === "9:16" ? [720, 1280] : ratio === "1:1" ? [720, 720] : [1280, 720];
      let totalDuration = 0;
      for (let i = 0; i < files.length; i++) {
        if (cancel.current) throw new Error("CANCELLED");
        setMessage(`正在整理第 ${i + 1} / ${files.length} 个镜头，保留原声并统一画幅…`);
        const source = `source-${i}`;
        await ffmpeg.writeFile(source, new Uint8Array(await files[i].arrayBuffer()));
        const probeExit = await ffmpeg.ffprobe(["-v", "error", "-show_entries", "stream=codec_type:format=duration", "-of", "json", source, "-o", "probe.json"]);
        if (probeExit !== 0) throw new Error(`无法读取视频（${probeExit}）：${lastMediaLog || "请检查文件是否损坏。"}`);
        const probe = JSON.parse(String(await ffmpeg.readFile("probe.json", "utf8")));
        const duration = Number(probe.format?.duration);
        if (!probe.streams?.some((stream: { codec_type: string }) => stream.codec_type === "video") || !Number.isFinite(duration) || duration <= 0 || (totalDuration += duration) > 600) throw new Error("请使用有效视频，合计时长需在 10 分钟以内。");
        const audio = probe.streams.some((stream: { codec_type: string }) => stream.codec_type === "audio");
        const args = ["-protocol_whitelist", "file,pipe", "-i", source, ...(!audio ? ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"] : []),
          "-map", "0:v:0", "-map", audio ? "0:a:0" : "1:a:0", "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24`,
          "-c:v", "libx264", "-preset", "ultrafast", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000", "-ac", "2", "-t", String(duration), "-shortest", `clip-${i}.mp4`];
        if (await ffmpeg.exec(args, 180000) !== 0) throw new Error("该镜头处理失败或超时，请缩短视频后重试。");
        await ffmpeg.deleteFile(source);
      }
      setMessage("镜头已就绪，正在合成 MP4…");
      await ffmpeg.writeFile("timeline.txt", files.map((_, i) => `file 'clip-${i}.mp4'`).join("\n"));
      if (await ffmpeg.exec(["-f", "concat", "-safe", "1", "-i", "timeline.txt", "-c", "copy", "-metadata", "comment=SASI assembled video; disclose AI-generated source material when publishing", "-movflags", "+faststart", "film.mp4"], 60000) !== 0) throw new Error("合成未完成，请重试。");
      const result = await ffmpeg.readFile("film.mp4");
      if (!(result instanceof Uint8Array) || !result.length) throw new Error("未能读取成片。");
      setOutput(URL.createObjectURL(new Blob([new Uint8Array(result)], { type: "video/mp4" })));
      setMessage(`已合成 ${files.length} 个镜头。下载后保存到你的设备。`);
    } catch (error) { setMessage(cancel.current ? "已停止合成，原视频保持不变。" : error instanceof Error ? error.message : "合成失败，请重试。"); }
    finally { engine.current?.terminate(); engine.current = null; active.current = false; setBusy(false); }
  }
  return <section className="mx-auto max-w-3xl rounded-3xl border border-current/15 bg-white/5 p-6">
    <p className="text-sm text-[#7c3aed]">SASI · 镜头合成</p><h1 className="mt-3 text-3xl font-semibold">镜头拍好了，一起变成片。</h1>
    <p className="mt-4 leading-7 opacity-70">选择已有视频，调整顺序，一键导出 MP4。保留原声，自动统一画幅；文件在浏览器处理，不上传、不收取生成费用。</p>
    <label className="mt-6 block">添加视频<input aria-label="添加待合成视频" className="mt-2 block w-full" type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" multiple disabled={busy} onChange={event => choose(event.target.files)} /></label>
    <p className="mt-2 text-sm opacity-60">本机合成上限：24 段、150MB、10 分钟。请保持页面打开；首次加载引擎约 32MB。</p>
    <ol className="mt-5 space-y-2">{files.map((file, index) => <li key={`${index}-${file.name}`} className="flex items-center gap-3 rounded-xl border border-current/10 p-3"><span className="min-w-0 flex-1 break-all">{index + 1}. {file.name}</span><button aria-label={`上移镜头 ${index + 1}`} disabled={busy || !index} onClick={() => move(index, -1)}>↑</button><button aria-label={`下移镜头 ${index + 1}`} disabled={busy || index === files.length - 1} onClick={() => move(index, 1)}>↓</button></li>)}</ol>
    <label className="mt-5 block">成片画幅<select className="ml-3 rounded-lg border border-current/20 bg-transparent p-2" disabled={busy} value={ratio} onChange={e => { setRatio(e.target.value); setOutput(""); }}><option>9:16</option><option>16:9</option><option>1:1</option></select></label>
    <button className="mt-5 rounded-xl bg-[#6d28d9] px-6 py-3 text-white disabled:opacity-40" disabled={busy || files.length < 2} onClick={() => void assemble()}>{busy ? "正在合成…" : "一键合成 MP4"}</button>
    {busy && <button className="ml-4" onClick={() => { cancel.current = true; engine.current?.terminate(); }}>停止</button>}
    {message && <p role="status" className="mt-4 leading-7">{message}</p>}
    {output && <div className="mt-5"><video controls className="max-h-96 w-full rounded-xl" src={output} /><a className="mt-4 inline-block rounded-xl bg-[#6d28d9] px-5 py-3 text-white" href={output} download="SASI-film.mp4">下载成片</a><p className="mt-2 text-sm opacity-60">使用 AI 生成素材时，发布时请保留 AI 来源说明并开启平台标识。</p></div>}
  </section>;
}
