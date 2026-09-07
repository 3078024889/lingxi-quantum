"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  budgetAssessment,
  CREDIT_PACKS,
  providerForQuality,
  SASI_PROVIDERS,
  SASI_QUALITY_TIERS,
  SASI_SKILLS,
  type SasiQuality,
} from "@/lib/sasi/catalog";

type Lang = "zh" | "en";
type Theme = "light" | "dark";
type View = "home" | "drama" | "code" | "skills" | "connections" | "billing";
type RouteHint = "drama" | "code" | "auto";

type StagedFile = {
  id: string;
  name: string;
  size: number;
  kind: "document" | "image" | "audio" | "video" | "code" | "other";
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set([
  "txt", "md", "docx", "pdf", "csv", "json", "yaml", "yml",
  "jpg", "jpeg", "png", "webp", "heic", "gif",
  "mp3", "wav", "m4a", "aac", "mp4", "mov", "webm",
  "zip", "js", "jsx", "ts", "tsx", "css", "html", "sql", "py", "go", "rs", "java",
]);

const studioNav: { id: View; zh: string; en: string; glyph: string }[] = [
  { id: "home", zh: "SASI 首页", en: "SASI Home", glyph: "✦" },
  { id: "drama", zh: "AI 短剧工坊", en: "AI Drama Studio", glyph: "▶" },
  { id: "code", zh: "编程构建部署", en: "Build & Deploy", glyph: "</>" },
  { id: "skills", zh: "Skills", en: "Skills", glyph: "◇" },
  { id: "connections", zh: "模型连接", en: "Model Connections", glyph: "⌁" },
  { id: "billing", zh: "余额与充值", en: "Balance & Billing", glyph: "¥" },
];

const fieldNav = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation", glyph: "◉" },
  { href: "/field-tests", zh: "场域精测", en: "Field Insights", glyph: "⌁" },
  { href: "/subconscious", zh: "重塑潜意识 · FREE", en: "Subconscious · FREE", glyph: "◎" },
  { href: "/practice", zh: "修炼技术 · FREE", en: "Practices · FREE", glyph: "♢" },
  { href: "/account", zh: "我的场域", en: "My Field", glyph: "○" },
];

const workflowZh = ["项目理解", "剧本结构", "人物设定", "身份板", "场景身份板", "故事板", "精分镜与配音", "视频镜头", "Timeline", "字幕与成片"];
const workflowEn = ["Project intake", "Story structure", "Characters", "Identity boards", "Scene bible", "Storyboard", "Shots & voice", "Video clips", "Timeline", "Subtitles & master"];

const legalZh = ["用户服务协议", "隐私政策", "AI创作规则", "充值计费与退款", "BYOK与第三方服务", "Skill发布与交易", "知识产权政策", "AI服务免责声明", "AI生成内容标识规则"];
const legalEn = ["Terms", "Privacy", "AI Creation Rules", "Billing & Refunds", "BYOK & Providers", "Skill Publishing", "IP Policy", "AI Disclaimer", "AI Content Labels"];

function copy(lang: Lang, zh: string, en: string) {
  return lang === "zh" ? zh : en;
}

function extensionOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

function classifyFile(name: string): StagedFile["kind"] {
  const ext = extensionOf(name);
  if (["jpg", "jpeg", "png", "webp", "heic", "gif"].includes(ext)) return "image";
  if (["mp3", "wav", "m4a", "aac"].includes(ext)) return "audio";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["zip", "js", "jsx", "ts", "tsx", "css", "html", "sql", "py", "go", "rs", "java"].includes(ext)) return "code";
  if (["txt", "md", "docx", "pdf", "csv", "json", "yaml", "yml"].includes(ext)) return "document";
  return "other";
}

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function routeFor(files: StagedFile[], text: string): RouteHint {
  if (files.some((file) => file.kind === "code") || /网站|应用|代码|报错|部署|github|repository|website|app|code|deploy/i.test(text)) return "code";
  if (files.some((file) => ["video", "audio", "image", "document"].includes(file.kind)) || /剧本|小说|短剧|视频|分镜|story|script|drama|video/i.test(text)) return "drama";
  return "auto";
}

function UploadHub({
  lang,
  files,
  onAdd,
  onRemove,
  onNotice,
}: {
  lang: Lang;
  files: StagedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onNotice: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function change(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    onAdd(Array.from(event.dataTransfer.files));
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".txt,.md,.docx,.pdf,.csv,.json,.yaml,.yml,.jpg,.jpeg,.png,.webp,.heic,.gif,.mp3,.wav,.m4a,.aac,.mp4,.mov,.webm,.zip,.js,.jsx,.ts,.tsx,.css,.html,.sql,.py,.go,.rs,.java"
        onChange={change}
      />
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={`mt-4 rounded-2xl border border-dashed px-4 py-4 transition ${dragging ? "border-[#7657ff] bg-[#7657ff]/10" : "border-current/15"}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full border border-current/15 px-3 py-2 text-xs font-medium">＋ {copy(lang, "添加附件", "Add files")}</button>
          <button type="button" onClick={() => onNotice(copy(lang, "资产库将在云端存储启用后开放；当前可直接选择本机文件。", "My Assets opens after cloud storage is enabled; local files can be staged now."))} className="rounded-full border border-current/15 px-3 py-2 text-xs opacity-70">{copy(lang, "我的资产", "My Assets")}</button>
          <button type="button" onClick={() => onNotice(copy(lang, "GitHub 授权尚未启用；目前可以上传 ZIP、README 或报错截图。", "GitHub authorization is not enabled yet; upload a ZIP, README or error screenshot for now."))} className="rounded-full border border-current/15 px-3 py-2 text-xs opacity-70">GitHub</button>
          <span className="text-xs opacity-45">{copy(lang, "拖拽、多文件或粘贴图片 · 单文件最大 100MB", "Drag, multi-select or paste images · 100MB per file")}</span>
        </div>
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file) => (
              <span key={file.id} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-current/5 px-3 py-2 text-xs">
                <span className="truncate">{file.name}</span><span className="opacity-45">{formatBytes(file.size)}</span>
                <button type="button" aria-label={copy(lang, "移除附件", "Remove file")} onClick={() => onRemove(file.id)} className="opacity-45 hover:opacity-100">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-5 opacity-45">{copy(lang, "文件目前只在本次浏览器任务中暂存，不会自动执行代码或对外上传。正式云端存储启用前不会假装已经保存。", "Files are staged only in this browser task. Code is never auto-executed or uploaded externally. Nothing is presented as cloud-saved before storage is enabled.")}</p>
    </div>
  );
}

export default function SasiWorkspace({ accountEmail }: { accountEmail: string | null }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState<Theme>("light");
  const [view, setView] = useState<View>("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [homeBrief, setHomeBrief] = useState("");
  const [brief, setBrief] = useState("");
  const [script, setScript] = useState("");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [seconds, setSeconds] = useState(30);
  const [quality, setQuality] = useState<SasiQuality>("fast");
  const [advanced, setAdvanced] = useState(false);
  const [videoProvider, setVideoProvider] = useState("veo-lite");
  const [budget, setBudget] = useState(30);
  const [episodes, setEpisodes] = useState("");
  const [notice, setNotice] = useState("");
  const [skillTab, setSkillTab] = useState<"discover" | "mine" | "create">("discover");
  const dark = theme === "dark";
  const effectiveProvider = advanced ? videoProvider : providerForQuality(quality);
  const quote = useMemo(() => budgetAssessment(effectiveProvider, seconds, budget), [effectiveProvider, seconds, budget]);
  const videoProviders = SASI_PROVIDERS.filter((item) => item.kind === "video");
  const suggestedRoute = routeFor(files, homeBrief);

  function addFiles(incoming: File[]) {
    const accepted: StagedFile[] = [];
    const rejected: string[] = [];
    for (const file of incoming) {
      const extension = extensionOf(file.name);
      if (!ACCEPTED_EXTENSIONS.has(extension) || file.size > MAX_FILE_SIZE) {
        rejected.push(file.name);
        continue;
      }
      accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`, name: file.name, size: file.size, kind: classifyFile(file.name) });
    }
    setFiles((current) => [...current, ...accepted].slice(0, 20));
    if (rejected.length) setNotice(copy(lang, `未加入：${rejected.join("、")}。请检查格式或 100MB 限制。`, `Not added: ${rejected.join(", ")}. Check format or the 100MB limit.`));
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));
    if (pasted.length) addFiles(pasted);
  }

  function startFromHome(target?: "drama" | "code") {
    const route = target ?? (suggestedRoute === "auto" ? "drama" : suggestedRoute);
    if (route === "code") {
      setBrief(homeBrief);
      setView("code");
    } else {
      setScript(homeBrief);
      setView("drama");
    }
    setNotice(copy(lang, route === "code" ? "已进入构建工作流，附件会随任务继续。" : "已进入短剧工作流，附件会随项目继续。", route === "code" ? "Build workflow selected; attachments stay with this task." : "Drama workflow selected; attachments stay with this project."));
  }

  async function prepare(kind: "code" | "drama") {
    const input = kind === "code" ? brief.trim() : script.trim();
    if (input.length < (kind === "code" ? 12 : 20) && files.length === 0) {
      setNotice(copy(lang, "请写下需求或添加附件。", "Add a brief or at least one attachment."));
      return;
    }
    try {
      const response = await fetch("/api/sasi/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          brief: input || copy(lang, "根据已暂存附件建立项目，等待云存储启用后解析。", "Prepare from staged attachments; parse after cloud storage is enabled."),
          seconds,
          budget,
          quality,
          episodes: episodes ? Number(episodes) : undefined,
          attachments: files.map(({ name, size, kind: fileKind }) => ({ name, size, kind: fileKind })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "PREPARE_FAILED");
      if (kind === "drama") {
        const plan = result.recommendation;
        setNotice(copy(lang,
          `预检完成：建议 ${plan.episodes} 集 × 约 ${plan.secondsPerEpisode} 秒。${result.generationBlocked ? `预算还差 ¥${result.quote.gap.toFixed(2)}，不会启动收费生成。` : "预算覆盖当前档位；最终确认后才会冻结余额。"}`,
          `Preflight complete: ${plan.episodes} episode(s) × about ${plan.secondsPerEpisode}s. ${result.generationBlocked ? `Budget gap ¥${result.quote.gap.toFixed(2)}; paid generation remains blocked.` : "Budget covers this tier; funds are reserved only after final confirmation."}`,
        ));
      } else {
        setNotice(copy(lang, "构建任务已完成预检；连接仓库后，写入代码和部署仍会分别请求确认。", "Build preflight complete. Repository writes and deployment each require separate confirmation."));
      }
    } catch {
      setNotice(copy(lang, "任务预检失败，请稍后重试。", "Task preflight failed. Try again later."));
    }
  }

  const shell = dark ? "min-h-screen bg-[#090b0f] text-[#f3f3ef]" : "min-h-screen bg-[#f7f7f3] text-[#171717]";
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";

  return (
    <div className={shell}>
      <button onClick={() => setMobileNav((value) => !value)} className="fixed left-4 top-4 z-50 rounded-xl border border-current/15 bg-inherit px-3 py-2 text-sm lg:hidden">☰ SASI</button>
      <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col overflow-y-auto border-r p-5 transition lg:translate-x-0 ${dark ? "border-white/10 bg-[#0d1015]" : "border-black/10 bg-white"}`}>
        <button type="button" onClick={() => { setView("home"); setMobileNav(false); }} className="mb-7 flex items-center gap-3 text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="h-10 w-10 rounded-xl" />
          <div><p className="font-display text-lg tracking-[.12em]">灵犀场 SASI</p><p className="text-[10px] uppercase tracking-[.2em] opacity-50">Create · Build · Deliver</p></div>
        </button>

        <p className="mb-2 text-[10px] uppercase tracking-[.22em] opacity-45">SASI Studio</p>
        <nav className="space-y-1">
          {studioNav.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${view === item.id ? (dark ? "bg-white text-black" : "bg-black text-white") : "hover:bg-current/5"}`}>
              <span className="w-7 text-center font-mono text-xs">{item.glyph}</span>{copy(lang, item.zh, item.en)}
            </button>
          ))}
        </nav>

        <p className="mb-2 mt-7 text-[10px] uppercase tracking-[.22em] opacity-45">{copy(lang, "第二层 · LINGXI FIELD", "SECOND LAYER · LINGXI FIELD")}</p>
        <nav className="space-y-1">
          {fieldNav.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm opacity-70 transition hover:bg-current/5 hover:opacity-100"><span className="w-7 text-center">{item.glyph}</span>{copy(lang, item.zh, item.en)}</Link>)}
        </nav>

        <div className="mt-auto space-y-3 border-t border-current/10 pt-4">
          <div className="flex gap-2"><button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{lang === "zh" ? "EN" : "中文"}</button><button onClick={() => setTheme(dark ? "light" : "dark")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{dark ? "☀ Light" : "☾ Dark"}</button></div>
          <Link href="/account" className="block rounded-xl border border-current/15 px-3 py-3"><p className="truncate text-sm">{accountEmail ?? copy(lang, "连接场域账户", "Connect account")}</p><p className="mt-1 text-[10px] opacity-50">{accountEmail ? copy(lang, "设置 · 切换 · 退出", "Settings · Switch · Sign out") : copy(lang, "登录后同步项目、作品与余额", "Sign in to sync projects, works and balance")}</p></Link>
        </div>
      </aside>

      <main className="min-h-screen px-5 pb-16 pt-20 lg:ml-[286px] lg:px-10 lg:pt-8">
        <header className="mx-auto flex max-w-[1280px] items-center justify-between border-b border-current/10 pb-5"><div><p className="text-xs uppercase tracking-[.22em] opacity-45">Lingxifield Sovereign AI Studio</p><p className="mt-2 text-sm opacity-65">{copy(lang, "从想法到可交付作品", "From idea to deliverable work")}</p></div><button onClick={() => setView("billing")} className={`rounded-xl px-4 py-2 text-sm ${dark ? "bg-[#d9ff73] text-black" : "bg-black text-white"}`}>{copy(lang, "余额 · 充值", "Balance · Top up")}</button></header>

        <div className="mx-auto mt-8 max-w-[1280px]">
          {view === "home" && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">LINGXIFIELD SASI</p>
              <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-[-.04em] sm:text-6xl lg:text-7xl">{copy(lang, "一个想法，在这里变成网站、应用、短剧与视频", "An idea becomes a website, app, drama or video here")}</h1>
              <p className="mt-5 max-w-4xl text-base leading-8 opacity-60 sm:text-lg">{copy(lang, "灵犀场 SASI 集 AI 编程构建、网站与应用部署、AI短剧制作、故事板、身份板、配音与视频生成于一体，并连接意识显化与场域精测。", "LingxiField SASI unifies AI software building, website and app deployment, drama production, storyboards, identity boards, voice and video generation—connected to Manifestation and Field Insights.")}</p>

              <div className={`mt-8 rounded-3xl border p-5 sm:p-7 ${panel}`}>
                <textarea value={homeBrief} onChange={(event) => setHomeBrief(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "你想创造什么？也可以直接粘贴文字、图片，或添加剧本、项目 ZIP、截图和视频……", "What do you want to create? Paste text or images, or add a script, project ZIP, screenshot or video…")} className="min-h-36 w-full resize-none bg-transparent text-lg leading-8 outline-none" />
                <UploadHub lang={lang} files={files} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onNotice={setNotice} />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">{[
                    ["制作一部 AI 短剧", "Make an AI drama", "drama"], ["构建一个网站", "Build a website", "code"], ["生成一段视频", "Generate a video", "drama"], ["导入我的剧本", "Import my script", "drama"], ["连接 GitHub 项目", "Connect GitHub", "code"],
                  ].map(([zh, en, target]) => <button key={zh} type="button" onClick={() => startFromHome(target as "drama" | "code")} className="rounded-full border border-current/15 px-3 py-2 text-xs hover:border-[#7657ff]">{copy(lang, zh, en)}</button>)}</div>
                  <button type="button" onClick={() => startFromHome()} className={`rounded-xl px-6 py-3 text-sm font-semibold ${dark ? "bg-white text-black" : "bg-black text-white"}`}>{suggestedRoute === "auto" ? copy(lang, "交给 SASI Auto", "Use SASI Auto") : suggestedRoute === "code" ? copy(lang, "进入构建工作流", "Open Build workflow") : copy(lang, "进入短剧工作流", "Open Drama workflow")}</button>
                </div>
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-2">
                <button type="button" onClick={() => setView("drama")} className={`group rounded-3xl border p-7 text-left transition hover:-translate-y-1 hover:border-[#e04d70]/60 ${panel}`}><p className="text-sm font-semibold text-[#e04d70]">▶ SASI DRAMA</p><h2 className="mt-5 text-3xl font-semibold">{copy(lang, "从剧本，到完整视频", "From script to finished video")}</h2><p className="mt-4 leading-7 opacity-60">{copy(lang, "导入剧本或只说一个故事。自动分析人物、剧情、动态集数、身份板、场景、故事板、分镜、配音与视频方案；每一阶段都能修改。", "Import a script or tell one story. Analyze characters, plot, dynamic episode count, identity boards, scenes, storyboards, shots, voice and video—with editing at every stage.")}</p><span className="mt-7 inline-block text-sm font-semibold">{copy(lang, "开始制作 →", "Start creating →")}</span></button>
                <button type="button" onClick={() => setView("code")} className={`group rounded-3xl border p-7 text-left transition hover:-translate-y-1 hover:border-[#7657ff]/60 ${panel}`}><p className="text-sm font-semibold text-[#7657ff]">&lt;/&gt; SASI BUILD</p><h2 className="mt-5 text-3xl font-semibold">{copy(lang, "从需求，到网站真正上线", "From requirement to a live product")}</h2><p className="mt-4 leading-7 opacity-60">{copy(lang, "描述需求或连接现有仓库，SASI 完成规划、编程、测试、修复与部署，并明确区分代码提交、部署和公网状态。", "Describe a requirement or connect a repository. SASI plans, codes, tests, repairs and deploys—with explicit commit, deployment and live-state evidence.")}</p><span className="mt-7 inline-block text-sm font-semibold">{copy(lang, "开始构建 →", "Start building →")}</span></button>
              </div>

              <div className="mt-7 rounded-3xl bg-[#151515] p-7 text-white"><p className="text-xs uppercase tracking-[.2em] text-[#d9ff73]">SASI AUTO</p><div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]"><div><h2 className="text-2xl font-semibold">{copy(lang, "你说目标，SASI 选择工作流与合适算力", "State the goal; SASI routes the workflow and compute")}</h2><p className="mt-3 max-w-3xl leading-7 text-white/60">{copy(lang, "普通模式只呈现快速、高清、电影级。具体模型与自有 API Key 仅在高级设置和模型连接中出现。", "Standard mode shows Fast, HD and Cinema only. Specific models and BYOK appear solely in advanced settings and Model Connections.")}</p></div><div className="flex gap-2 self-center">{SASI_QUALITY_TIERS.map((tier) => <span key={tier.id} className="rounded-full border border-white/15 px-4 py-2 text-xs">{copy(lang, tier.zh, tier.en)}</span>)}</div></div></div>
            </section>
          )}

          {view === "code" && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">SASI BUILD</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{copy(lang, "编程、构建、验证、部署", "Code, build, verify and deploy")}</h1><p className="mt-4 max-w-3xl leading-8 opacity-60">{copy(lang, "从一句需求、页面截图、报错日志或现有项目进入真实仓库工作流。", "Start from a brief, screenshot, error log or existing project and enter a real repository workflow.")}</p>
              <div className={`mt-8 rounded-3xl border p-6 ${panel}`}><textarea value={brief} onChange={(event) => setBrief(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "描述产品、错误、现有仓库与部署目标……", "Describe the product, problem, repository and deployment target…")} className="min-h-48 w-full resize-none bg-transparent text-base leading-7 outline-none"/><UploadHub lang={lang} files={files} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onNotice={setNotice} /><div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs opacity-55">SASI Auto · {copy(lang, "快速 / 标准 / 深度", "Fast / Standard / Deep")}</span><button onClick={() => prepare("code")} className={`rounded-xl px-7 py-3 text-sm font-semibold ${dark ? "bg-white text-black" : "bg-black text-white"}`}>{copy(lang, "建立构建任务", "Prepare build task")}</button></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">{SASI_SKILLS.filter((skill) => (skill.modes as readonly string[]).includes("code")).map((skill) => <div key={skill.id} className="rounded-2xl border border-current/10 p-5"><p className="font-medium"><span className="mr-2 text-[#7657ff]">{skill.glyph}</span>{copy(lang, skill.zh, skill.en)}</p><p className="mt-2 text-xs leading-5 opacity-55">{copy(lang, skill.noteZh, skill.noteEn)}</p></div>)}</div>
            </section>
          )}

          {view === "drama" && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e04d70]">SASI DRAMA</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{copy(lang, "从任意素材，到可逐步修改的成片工作流", "From any source to an editable production workflow")}</h1>
              <div className="mt-6 flex flex-wrap gap-2">{[["我只有一个想法", "I have an idea"], ["我有完整剧本", "I have a script"], ["我有小说 / 故事", "I have a novel"], ["我已经有角色", "I have characters"], ["我已有故事板", "I have storyboards"], ["只生成一个镜头", "Generate one shot"]].map(([zh, en]) => <button key={zh} type="button" onClick={() => setScript(copy(lang, zh, en))} className="rounded-full border border-current/15 px-4 py-2 text-xs hover:border-[#e04d70]">{copy(lang, zh, en)}</button>)}</div>
              <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className={`rounded-3xl border p-6 ${panel}`}><textarea value={script} onChange={(event) => setScript(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "写下创意，或导入剧本、小说、人物图、故事板、音频和已有视频……", "Write an idea or import a script, novel, character image, storyboard, audio or existing video…")} className="min-h-36 w-full resize-none bg-transparent text-base leading-7 outline-none"/><UploadHub lang={lang} files={files} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onNotice={setNotice} /><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs opacity-60">{copy(lang, "目标总时长（5–600秒）", "Total duration (5–600 sec)")}<input type="number" min={5} max={600} value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "集数（留空由 SASI 建议）", "Episodes (optional)")}<input type="number" min={1} max={200} value={episodes} onChange={(event) => setEpisodes(event.target.value)} placeholder={copy(lang, "动态分析，不预设", "Dynamic, not preset")} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "我的预算（人民币）", "My budget (RMB)")}<input type="number" min={0} step="1" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "希望质量", "Quality target")}<select value={quality} onChange={(event) => setQuality(event.target.value as SasiQuality)} className={`mt-2 w-full rounded-xl border border-current/15 px-3 py-3 text-base outline-none ${dark ? "bg-[#11151b]" : "bg-white"}`}>{SASI_QUALITY_TIERS.map((item) => <option key={item.id} value={item.id}>{copy(lang, item.zh, item.en)}</option>)}</select></label></div><button onClick={() => setAdvanced((value) => !value)} className="mt-4 text-xs underline underline-offset-4 opacity-60">{advanced ? copy(lang, "收起高级设置", "Hide advanced settings") : copy(lang, "高级设置与自选模型", "Advanced settings and model choice")}</button>{advanced && <label className="mt-3 block text-xs opacity-60">Provider<select value={videoProvider} onChange={(event) => setVideoProvider(event.target.value)} className={`mt-2 w-full rounded-xl border border-current/15 px-3 py-3 text-base outline-none ${dark ? "bg-[#11151b]" : "bg-white"}`}>{videoProviders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<button onClick={() => prepare("drama")} className="mt-6 w-full rounded-xl bg-[#e04d70] py-3 text-sm font-semibold text-white">{copy(lang, "分析素材并提出生产方案", "Analyze material and propose a plan")}</button></div>
                <div className={`rounded-3xl p-6 ${dark ? "bg-[#d9ff73] text-black" : "bg-[#151515] text-white"}`}><p className="text-xs uppercase tracking-[.2em] opacity-55">BUDGET QUALITY GUARD</p><p className="mt-5 text-3xl font-semibold">¥{quote.price.toFixed(2)}</p><p className="mt-1 text-sm opacity-60">{seconds}s · {copy(lang, SASI_QUALITY_TIERS.find((tier) => tier.id === quality)?.zh ?? "快速", SASI_QUALITY_TIERS.find((tier) => tier.id === quality)?.en ?? "Fast")}</p><div className="my-5 border-t border-current/15"/><p className="text-sm">{advanced ? quote.provider?.name : copy(lang, "SASI Auto · 自动路由", "SASI Auto · automatic routing")}</p><dl className="mt-5 space-y-2 text-xs"><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "预计总计", "Estimated total")}</dt><dd>¥{quote.price.toFixed(2)}</dd></div><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "我的预算", "My budget")}</dt><dd>¥{quote.budget.toFixed(2)}</dd></div><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "预算差额", "Budget gap")}</dt><dd>¥{quote.gap.toFixed(2)}</dd></div></dl><div className={`mt-5 rounded-xl p-3 text-xs leading-5 ${quote.canConfirm ? "bg-emerald-500/15" : "bg-amber-500/20"}`}>{quote.canConfirm ? copy(lang, `当前余额确认后，本次最高不超过 ¥${quote.price.toFixed(2)}。只有最终确认才冻结余额。`, `After balance confirmation, this run will not exceed ¥${quote.price.toFixed(2)}. Funds are reserved only after final confirmation.`) : copy(lang, "预算不足：不会静默降质。可增加预算、缩短时长、智能优化或使用 BYOK。", "Insufficient budget: no silent downgrade. Increase budget, shorten duration, optimize intelligently or use BYOK.")}</div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><button className="rounded-lg border border-current/15 py-2" onClick={() => setBudget(Math.ceil(quote.price))}>{copy(lang, "提高预算", "Raise budget")}</button><button className="rounded-lg border border-current/15 py-2" onClick={() => setSeconds(Math.max(5, Math.floor(seconds * .7)))}>{copy(lang, "缩短时长", "Shorten")}</button></div></div>
              </div>
              <div className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{copy(lang, "可逐步编辑的生产链", "Editable production chain")}</h2><span className="text-xs opacity-45">{copy(lang, "不会一键烧完整部剧", "No blind one-click full run")}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(lang === "zh" ? workflowZh : workflowEn).map((item, index) => <div key={item} className="rounded-2xl border border-current/10 p-4"><p className="text-xs opacity-35">{String(index + 1).padStart(2, "0")}</p><p className="mt-3 text-sm font-medium">{item}</p><p className="mt-2 text-[11px] opacity-45">{index < 3 ? copy(lang, "分析后可修改", "Editable after analysis") : copy(lang, "生成、编辑或重做", "Generate, edit or redo")}</p></div>)}</div></div>
              <div className="mt-7 rounded-3xl border border-current/10 p-6"><p className="text-xs uppercase tracking-[.2em] text-[#e04d70]">{copy(lang, "电影级重点镜头", "Cinema-grade key shots")}</p><p className="mt-3 leading-7 opacity-65">{copy(lang, "SASI 可将高质量视频模型优先分配给人物登场、高潮、战斗与情绪特写，其余镜头采用匹配预算的高清方案；任何调整都会先显示质量与价格变化。", "SASI can reserve high-quality video models for entrances, climaxes, action and emotional close-ups, while routing remaining shots to budget-matched HD options. Every change reveals its quality and price impact first.")}</p></div>
            </section>
          )}

          {view === "skills" && (
            <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">SKILL MARKETPLACE</p><h1 className="mt-3 text-4xl font-semibold">{copy(lang, "把可靠工作流变成可复用能力", "Turn reliable workflows into reusable capabilities")}</h1><div className="mt-6 flex flex-wrap gap-2">{[["discover", "发现 Skills", "Discover"], ["mine", "我的 Skills", "My Skills"], ["create", "创建 / 上传 / 发布", "Create / Upload / Publish"]].map(([id, zh, en]) => <button key={id} onClick={() => setSkillTab(id as typeof skillTab)} className={`rounded-full px-4 py-2 text-sm ${skillTab === id ? "bg-[#7657ff] text-white" : "border border-current/15"}`}>{copy(lang, zh, en)}</button>)}</div>{skillTab === "discover" ? <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SASI_SKILLS.map((skill, index) => <article key={skill.id} className={`rounded-3xl border p-6 ${panel}`}><span className="text-2xl text-[#7657ff]">{skill.glyph}</span><h2 className="mt-5 text-lg font-semibold">{copy(lang, skill.zh, skill.en)}</h2><p className="mt-3 text-sm leading-6 opacity-55">{copy(lang, skill.noteZh, skill.noteEn)}</p><p className="mt-5 text-sm font-semibold">{index < 3 ? copy(lang, "免费", "Free") : `¥${[1.99, 5.99, 9.99][index % 3]}`}</p></article>)}</div> : <div className={`mt-7 rounded-3xl border p-7 ${panel}`}><h2 className="text-2xl font-semibold">{skillTab === "mine" ? copy(lang, "我的 Skills", "My Skills") : copy(lang, "创建、上传与发布 Skill", "Create, upload and publish a Skill")}</h2><p className="mt-4 max-w-2xl leading-7 opacity-60">{copy(lang, "用户 Skill 交易将在沙箱、权限声明、恶意文件扫描和审核流程完成后开放。计划支持免费、¥1.99、¥5.99、¥9.99 与自定义价格；创作者分成与平台服务费由后台配置。", "User Skill trading opens after sandboxing, permission declarations, malware scanning and review are complete. Planned pricing includes free, ¥1.99, ¥5.99, ¥9.99 and custom prices; creator share and platform fee remain configurable.")}</p><button onClick={() => setNotice(copy(lang, "安全沙箱和审核系统未启用前，不接受公开发布。", "Public publishing stays disabled until the safety sandbox and review system are enabled."))} className="mt-6 rounded-xl border border-current/20 px-5 py-3 text-sm">{copy(lang, "查看开放条件", "View launch requirements")}</button></div>}</section>
          )}

          {view === "connections" && (
            <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">BYOK · OPTIONAL</p><h1 className="mt-3 text-4xl font-semibold">{copy(lang, "模型连接，小白也能看懂", "Model connections without the jargon")}</h1><p className="mt-4 max-w-3xl leading-8 opacity-60">{copy(lang, "默认使用 SASI Auto，不需要自备 Key。已有模型额度、希望费用由自己的 Provider 账户承担时，再选择连接。", "SASI Auto works without your own key. Connect a provider only when you already have model credits or want charges billed directly to that provider account.")}</p><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SASI_PROVIDERS.map((provider) => <article key={provider.id} className={`rounded-3xl border p-6 ${panel}`}><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{provider.name}</h2><p className="mt-1 text-[11px] uppercase tracking-[.16em] opacity-40">{provider.kind === "video" ? copy(lang, "视频生成", "Video generation") : copy(lang, "编程与推理", "Code and reasoning")}</p></div><span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] text-amber-600">{copy(lang, "未连接", "Not connected")}</span></div><p className="mt-4 text-sm leading-6 opacity-55">{copy(lang, provider.noteZh, provider.noteEn)}</p><div className="mt-6 flex gap-2"><button onClick={() => setNotice(copy(lang, "安全的服务端 Key 保管与连接测试接口尚未启用。请勿在普通输入框粘贴 Key。", "Secure server-side key storage and connection testing are not enabled. Never paste keys into a normal prompt."))} className="rounded-lg border border-current/20 px-4 py-2 text-xs">{copy(lang, "连接", "Connect")}</button><button onClick={() => setNotice(copy(lang, "正式开放时会提供对应官方创建入口。", "The official provider setup link will appear when this connection opens."))} className="rounded-lg px-3 py-2 text-xs underline opacity-55">{copy(lang, "如何获取 Key", "Get a key")}</button></div></article>)}</div></section>
          )}

          {view === "billing" && (
            <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">BALANCE</p><h1 className="mt-3 text-4xl font-semibold">{copy(lang, "人民币余额，费用先看清再确认", "RMB balance with confirmation before every charge")}</h1><p className="mt-4 max-w-3xl leading-8 opacity-60">{copy(lang, "前台只显示人民币。每次收费生成先展示明细、最高金额和质量结果；确认后才冻结余额，未产生第三方成本的失败任务自动释放。意识显化单独付费，不占用 SASI 余额。", "The interface shows RMB only. Every paid generation reveals the breakdown, maximum charge and quality result before funds are reserved. Failed jobs that incur no provider cost release the reservation. Manifestation is billed separately.")}</p><div className="mt-8 grid gap-4 md:grid-cols-3">{CREDIT_PACKS.map((pack) => <article key={pack.id} className={`rounded-3xl border p-7 ${panel}`}><p className="text-xs uppercase tracking-[.18em] opacity-45">{copy(lang, "充值金额", "Top-up")}</p><p className="mt-3 text-3xl font-semibold">¥{pack.rmb}</p><button onClick={() => setNotice(copy(lang, "余额账本迁移和支付回调未完成前不会收款。", "No payment is taken until the balance ledger migration and payment callbacks are complete."))} className="mt-7 w-full rounded-xl border border-current/20 py-3 text-sm">{copy(lang, "准备充值", "Prepare top-up")}</button></article>)}</div><div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-7">{copy(lang, "零预算启动原则：只有用户资金确认到账后才创建供应商任务。平台会预留失败重试、汇率、支付手续费与退款准备金，不赠送需要平台垫付的生成算力。", "Zero-upfront rule: provider jobs begin only after user funds settle. The platform reserves for retries, FX, payment fees and refunds, and never gives away compute that requires platform-funded spend.")}</div></section>
          )}

          <footer className="mt-16 border-t border-current/10 py-8"><p className="text-xs uppercase tracking-[.2em] opacity-40">{copy(lang, "法律与规则", "Legal & Rules")}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{(lang === "zh" ? legalZh : legalEn).map((label) => <Link key={label} href="/legal/sasi" className="text-xs opacity-55 hover:opacity-100">{label}</Link>)}</div><p className="mt-6 max-w-4xl text-xs leading-6 opacity-40">{copy(lang, "SASI 不提供内容社区发布。所有真实生成、充值、用户 Skill 发布及云端文件存储，只会在相应安全与结算能力启用后开放。", "SASI does not operate a publishing community. Live generation, top-ups, user Skill publishing and cloud file storage open only after the relevant safety and settlement controls are enabled.")}</p></footer>
        </div>
      </main>

      {notice && <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border p-4 text-sm shadow-2xl ${dark ? "border-white/15 bg-[#151922]" : "border-black/10 bg-white"}`}><button onClick={() => setNotice("")} className="float-right ml-4 opacity-45">×</button>{notice}</div>}
    </div>
  );
}
