"use client";

import { useRef, useState } from "react";

type Shot = {
  id: string;
  text: string;
  character: string;
  scene: string;
  framing: string;
  camera: string;
  startMs: number;
  endMs: number;
};

type Plan = {
  engine: string;
  externalApiRequired: boolean;
  characters: string[];
  scenes: string[];
  shots: Shot[];
  totalMs: number;
  subtitleSrt: string;
};

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const chars = [...text];
  const lines: string[] = [];
  let line = "";
  for (const ch of chars) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 8);
}

export default function SasiAutonomousDrama() {
  const [script, setScript] = useState("深夜，林秋走进空荡的图书馆。门锁突然坏了。周晨赶来，把备用钥匙放在桌上。两个人听见走廊尽头传来脚步声。");
  const [seconds, setSeconds] = useState(4);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [message, setMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  async function createPlan() {
    if (!script.trim() || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/sasi/drama/autonomous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, secondsPerShot: seconds }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "整理失败");
      setPlan(body);
      setMessage(`已整理 ${body.shots?.length || 0} 个镜头。无需连接外部模型。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "整理失败");
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    if (!plan) return;
    saveBlob(new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" }), "lingxifield-sasi-drama.json");
  }

  function exportSrt() {
    if (!plan) return;
    saveBlob(new Blob([plan.subtitleSrt], { type: "text/plain;charset=utf-8" }), "lingxifield-sasi-drama.srt");
  }

  async function renderWebm() {
    if (!plan?.shots.length || rendering) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
      setMessage("当前浏览器不支持直接生成视频，请使用最新版 Chrome / Edge。JSON 与字幕仍可正常导出。");
      return;
    }

    setRendering(true);
    setMessage("正在生成可播放短剧预览…");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setRendering(false);
      setMessage("当前浏览器无法建立画面。");
      return;
    }

    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.start(500);

    const width = canvas.width;
    const height = canvas.height;
    const shotDuration = Math.max(2000, Math.round(plan.totalMs / plan.shots.length));

    for (let i = 0; i < plan.shots.length; i++) {
      const shot = plan.shots[i];
      const started = performance.now();
      while (performance.now() - started < shotDuration) {
        const elapsed = performance.now() - started;
        const progress = Math.min(1, elapsed / shotDuration);

        ctx.fillStyle = "#0b0b0e";
        ctx.fillRect(0, 0, width, height);
        const glow = ctx.createRadialGradient(width * 0.5, height * 0.42, 10, width * 0.5, height * 0.42, width * 0.75);
        glow.addColorStop(0, "rgba(199,164,92,.22)");
        glow.addColorStop(1, "rgba(11,11,14,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#c7a45c";
        ctx.font = "600 30px sans-serif";
        ctx.fillText(`LINGXIFIELD · SASI   ${shot.id}`, 64, 92);

        ctx.fillStyle = "#8d8d96";
        ctx.font = "28px sans-serif";
        ctx.fillText(`${shot.scene} · ${shot.framing} · ${shot.camera}`, 64, 150);

        ctx.fillStyle = "#f3efe4";
        ctx.font = "600 54px sans-serif";
        const lines = wrap(ctx, shot.text, width - 128);
        lines.forEach((line, index) => ctx.fillText(line, 64, 280 + index * 76));

        ctx.fillStyle = "#b7b3aa";
        ctx.font = "30px sans-serif";
        ctx.fillText(`人物：${shot.character}`, 64, height - 140);

        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(64, height - 72, width - 128, 8);
        ctx.fillStyle = "#c7a45c";
        ctx.fillRect(64, height - 72, (width - 128) * progress, 8);

        await new Promise((resolve) => setTimeout(resolve, 33));
      }
    }

    recorder.stop();
    await stopped;
    stream.getTracks().forEach((track) => track.stop());
    saveBlob(new Blob(chunks, { type: mime }), "lingxifield-sasi-drama-preview.webm");
    setRendering(false);
    setMessage("短剧预览已生成并保存。整个过程没有调用外部生成模型。");
  }

  return (
    <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[.16em] text-[var(--lx-faint)]">SASI · 自主短剧</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--lx-ink)]">不连接外部模型，也能把故事变成镜头、字幕和可播放预览。</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">
          默认使用灵犀场自己的规则、场景图和时间线生成。外部模型只作为以后可选的写实镜头增强，不再是基础功能的前置条件。
        </p>
      </div>

      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        rows={8}
        className="mt-6 w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-bg)] p-4 text-sm leading-7 text-[var(--lx-ink)] outline-none"
        placeholder="输入故事、剧本或分场…"
      />
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm text-[var(--lx-muted)]">
          每镜时长
          <select value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-2">
            {[2,3,4,5,6,8].map((n) => <option key={n} value={n}>{n} 秒</option>)}
          </select>
        </label>
        <button type="button" disabled={busy || !script.trim()} onClick={createPlan} className="rounded-full bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">
          {busy ? "正在整理…" : "生成短剧方案"}
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-[var(--lx-muted)]">{message}</p>}

      {plan && (
        <div className="mt-7 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--lx-soft)] p-4"><b className="text-[var(--lx-ink)]">{plan.shots.length}</b><span className="ml-2 text-sm text-[var(--lx-muted)]">个镜头</span></div>
            <div className="rounded-2xl bg-[var(--lx-soft)] p-4"><b className="text-[var(--lx-ink)]">{Math.round(plan.totalMs / 1000)}</b><span className="ml-2 text-sm text-[var(--lx-muted)]">秒</span></div>
            <div className="rounded-2xl bg-[var(--lx-soft)] p-4"><b className="text-[var(--lx-ink)]">0</b><span className="ml-2 text-sm text-[var(--lx-muted)]">个外部 API</span></div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {plan.shots.map((shot) => (
              <article key={shot.id} className="rounded-2xl border border-[var(--lx-line)] p-4">
                <div className="flex items-center justify-between gap-3"><b>{shot.id}</b><span className="text-xs text-[var(--lx-faint)]">{shot.framing} · {shot.camera}</span></div>
                <p className="mt-2 text-sm leading-6 text-[var(--lx-ink)]">{shot.text}</p>
                <p className="mt-2 text-xs text-[var(--lx-muted)]">{shot.character} · {shot.scene}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={exportJson} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">保存短剧工程</button>
            <button type="button" onClick={exportSrt} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">保存字幕 SRT</button>
            <button type="button" disabled={rendering} onClick={renderWebm} className="rounded-full bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)] disabled:opacity-40">
              {rendering ? "正在生成视频…" : "生成可播放视频"}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} width={1080} height={1920} className="hidden" />
    </section>
  );
}
