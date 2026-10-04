"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import PaidActionButton from "@/components/tools/PaidActionButton";
import { localMediaDuration } from "@/lib/tools/autonomous/transcribe-local";
import type { ToolResultFile } from "@/lib/tools/types";
import { createFfmpegRuntime } from "@/lib/tools/media/runtime";

type Preset = "voice" | "noise" | "normalize" | "hum";

function copyBytes(data: Uint8Array | string) {
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

export default function AudioCleanupWorkbench() {
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<Preset>("voice");
  const [durations,setDurations]=useState<number[]>([]);
  const [previewUrl,setPreviewUrl]=useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<ToolResultFile[]>([]);

  useEffect(()=>{let active=true;void(async()=>{const next:number[]=[];for(const file of files)next.push(await localMediaDuration(file).catch(()=>60));if(active)setDurations(next)})();return()=>{active=false}},[files]);
  useEffect(()=>()=>{if(previewUrl)URL.revokeObjectURL(previewUrl)},[previewUrl]);
  const billableMinutes=useMemo(()=>durations.reduce((sum,seconds)=>sum+Math.max(1,Math.ceil(seconds/60)),0),[durations]);
  async function run(previewOnly=false) {
    setBusy(true);
    setError("");
    setResults([]);

    try {
      const output: ToolResultFile[] = [];

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const ffmpeg = await createFfmpegRuntime((progress) =>
          setStage(`${index + 1}/${files.length} · ${Math.round(progress * 100)}%`),
        );

        try {
          const ext = file.name.split(".").pop() || "bin";
          const input = `audio-${index}.${ext}`;
          const out = `clean-${index}.mp3`;
          await ffmpeg.writeFile(input, await fetchFile(file));

          const filters: Record<Preset, string> = {
            voice: "highpass=f=80,lowpass=f=12000,afftdn=nf=-25,dynaudnorm=f=150:g=15",
            noise: "afftdn=nf=-28,highpass=f=60,lowpass=f=15000",
            normalize: "loudnorm=I=-16:LRA=11:TP=-1.5",
            hum: "highpass=f=80,equalizer=f=50:t=q:w=1:g=-18,equalizer=f=60:t=q:w=1:g=-18,dynaudnorm",
          };

          let code = await ffmpeg.exec([
            "-i", input,
            ...(previewOnly?["-t","30"]:[]),
            "-vn",
            "-af", filters[preset],
            "-c:a", "libmp3lame",
            "-b:a", "192k",
            out,
          ]);

          if (code !== 0 && (preset === "voice" || preset === "noise")) {
            code = await ffmpeg.exec([
              "-i", input,
              ...(previewOnly?["-t","30"]:[]),
              "-vn",
              "-af", "highpass=f=80,lowpass=f=12000,dynaudnorm",
              "-c:a", "libmp3lame",
              "-b:a", "192k",
              out,
            ]);
          }

          if (code !== 0) throw new Error(`AUDIO_CLEANUP_${code}`);

          const data = copyBytes(await ffmpeg.readFile(out));
          const blob = new Blob([data.buffer], { type: "audio/mpeg" });
          if(previewOnly){if(index===0){if(previewUrl)URL.revokeObjectURL(previewUrl);setPreviewUrl(URL.createObjectURL(blob));}}else{output.push({name:file.name.replace(/\.[^.]+$/,"")+"-clean.mp3",blob,mime:"audio/mpeg",size:blob.size});}
        } finally {
          try {
            ffmpeg.terminate();
          } catch {}
        }
      }

      setResults(output);
      setStage("");
    } catch (cause) {
      setStage("");
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <FileDropzone
        accept="audio/*,video/*"
        multiple
        append
        maxFiles={20}
        maxSizeMB={500}
        files={files}
        onChange={(next) => {
          setFiles(next);
          setResults([]);
          setError("");
        }}
        disabled={busy}
        kind="media"
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["voice", "人声清晰"],
            ["noise", "背景噪声降低"],
            ["normalize", "响度标准化"],
            ["hum", "低频嗡声抑制"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPreset(value)}
            className={`rounded-xl border p-3 text-left text-sm ${
              preset === value
                ? "border-[var(--lx-line-strong)] bg-[var(--lx-soft)]"
                : "border-[var(--lx-line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs leading-5 text-[var(--lx-muted)]">
        这是本地 FFmpeg 频域滤波、动态范围与响度处理，不冒充生成式 AI 修复。强风、多人重叠说话或严重爆音无法保证完整恢复；建议试听原音和结果后再使用。
      </p>

      <div className="flex flex-wrap gap-3"><button disabled={!files.length||busy} onClick={()=>void run(true)} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm disabled:opacity-40">免费试听前 30 秒</button>{files.length>0&&billableMinutes>0&&!busy&&<PaidActionButton toolId="audio-cleanup" quantity={billableMinutes} metadata={{minutes:billableMinutes,files:files.length,preset}} onPaid={()=>run(false)} label={`处理完整音频 · ${billableMinutes}个起始分钟`}/>}</div>{previewUrl&&<div className="rounded-xl border border-[var(--lx-line)] p-3"><div className="mb-2 text-xs text-[var(--lx-muted)]">免费 30 秒试听，不提供试听文件导出。</div><audio controls src={previewUrl} className="w-full"/></div>}

      {stage && <p className="text-sm text-[var(--lx-muted)]">{stage}</p>}

      {!!results.length && (
        <ResultPanel
          sourceSlug="audio-cleanup"
          files={results}
          messageZh={`已生成 ${results.length} 个清理后的 MP3。`}
          messageEn={`Generated ${results.length} cleaned MP3 file(s).`}
        />
      )}

      {error && <p className="text-sm text-[var(--lx-danger)]">{error}</p>}
    </div>
  );
}
