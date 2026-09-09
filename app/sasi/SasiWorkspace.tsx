"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  budgetAssessment,
  CREDIT_PACKS,
  routeForQuality,
  SASI_QUALITY_TIERS,
  SASI_SKILLS,
  type SasiQuality,
} from "@/lib/sasi/catalog";
import { SasiProductionAccount, SasiProjectProduction } from "@/app/sasi/SasiProductionPanels";
import CangXuanDirectorStudio from "@/app/sasi/CangXuanDirectorStudio";
import ConnectionCenter from "@/app/sasi/ConnectionCenter";
import { DramaVisualWorkspace, SasiAccountCenter, SasiWorkLibrary } from "@/app/sasi/SasiV3Panels";

type Lang = "zh" | "en";
type Theme = "light" | "dark";
type View = "home" | "director" | "drama" | "code" | "skills" | "connections" | "billing" | "works" | "account" | "project";
type RouteHint = "drama" | "code" | "auto";

type StagedFile = {
  id: string;
  name: string;
  size: number;
  kind: "document" | "image" | "audio" | "video" | "code" | "other";
  source: File;
};

type SasiProjectSummary = {
  id: string;
  kind: "build" | "drama";
  title: string;
  currentVersion: number;
  nodeCount?: number;
  updatedAt?: string;
};

type SasiProjectDetail = {
  project: SasiProjectSummary;
  nodes: { id: string; type: string; version: number; status: string }[];
  dependencies: { upstreamNodeId: string; downstreamNodeId: string }[];
  assets: { id: string; name: string; kind: string; declaredSize: number; verifiedSize: number | null; status: string; rejectionReason: string | null }[];
  jobs: { id: string; status: string; canCancel: boolean; quotedPoints: number; reservedPoints: number; settledPoints: number; errorCode: string | null; input: Record<string, unknown>; createdAt: string }[];
  deliveries: { id: string; jobId: string; mimeType: string; byteSize: number; aiGenerated: boolean; createdAt: string }[];
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
  { id: "director", zh: "苍玄 AI 导演", en: "CangXuan Director", glyph: "◈" },
  { id: "drama", zh: "AI 短剧工坊", en: "AI Drama Studio", glyph: "▶" },
  { id: "code", zh: "编程构建部署", en: "Build & Deploy", glyph: "</>" },
  { id: "skills", zh: "Skills", en: "Skills", glyph: "◇" },
  { id: "connections", zh: "模型与 API", en: "Models & API", glyph: "⌁" },
  { id: "billing", zh: "余额与用量", en: "Balance & Usage", glyph: "◎" },
  { id: "works", zh: "我的作品库", en: "My Works", glyph: "▣" },
  { id: "account", zh: "我的账户", en: "My Account", glyph: "○" },
];

const fieldNav = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation", glyph: "◉" },
  { href: "/field-tests", zh: "场域精测", en: "Field Insights", glyph: "⌁" },
  { href: "/subconscious", zh: "重塑潜意识 · 开放体验", en: "Subconscious · Open", glyph: "◎" },
  { href: "/practice", zh: "修炼技术 · 开放体验", en: "Practices · Open", glyph: "♢" },
  { href: "/account", zh: "我的场域", en: "My Field", glyph: "○" },
];

const workflowZh = ["项目理解", "剧本结构", "人物设定", "身份板", "场景身份板", "故事板", "精分镜与配音", "视频镜头", "Timeline", "字幕与成片"];
const workflowEn = ["Project intake", "Story structure", "Characters", "Identity boards", "Scene bible", "Storyboard", "Shots & voice", "Video clips", "Timeline", "Subtitles & master"];

const legalZh = ["用户服务协议", "隐私政策", "AI创作规则", "制作账户与退还", "外部能力接入", "能力作品发布", "知识产权政策", "AI服务免责声明", "AI生成内容标识规则"];
const legalEn = ["Terms", "Privacy", "AI Creation Rules", "Production Account", "External Capabilities", "Capability Publishing", "IP Policy", "AI Disclaimer", "AI Content Labels"];

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
  onOpenConnections,
}: {
  lang: Lang;
  files: StagedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onNotice: (message: string) => void;
  onOpenConnections?: () => void;
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
          <button type="button" onClick={() => onNotice(copy(lang, "项目资产已进入私有隔离与索引体系；请先建立或打开项目查看归属资产。", "Project assets now use private quarantine and indexing; create or open a project to review its owned assets."))} className="rounded-full border border-current/15 px-3 py-2 text-xs opacity-70">{copy(lang, "我的资产", "My Assets")}</button>
          <button type="button" onClick={() => onOpenConnections ? onOpenConnections() : onNotice(copy(lang,"请从左侧能力中枢打开 GitHub 与部署连接指引。","Open Capability Center from the sidebar for GitHub and deployment setup."))} className="rounded-full border border-current/15 px-3 py-2 text-xs opacity-70">GitHub · {copy(lang,"连接指引","Setup")}</button>
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
      <p className="mt-2 text-[11px] leading-5 opacity-45">{copy(lang, "文件会先在本次浏览器任务中暂存；建立项目后才进入私有隔离通道，完成归属校验与安全索引。任何代码都不会被自动执行。", "Files are staged in this browser task first. Only after project creation do they enter a private quarantine channel for ownership checks and safe indexing. Code is never auto-executed.")}</p>
    </div>
  );
}

export default function SasiWorkspace({ accountEmail }: { accountEmail: string | null }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);
  const [view, setView] = useState<View>("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [homeBrief, setHomeBrief] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [script, setScript] = useState("");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [seconds, setSeconds] = useState(30);
  const [quality, setQuality] = useState<SasiQuality>("fast");
  const [budget, setBudget] = useState(3000);
  const [episodes, setEpisodes] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("lingxi-site-theme");
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
    setThemeReady(true);
    const requestedView = new URLSearchParams(window.location.search).get("view");
    const routeView: Record<string, View> = { home: "home", director: "director", drama: "drama", build: "code", skills: "skills", capabilities: "connections", models: "connections", billing: "billing", works: "works", account: "account", project: "project" };
    if (requestedView && routeView[requestedView]) setView(routeView[requestedView]);
  }, []);
  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("lingxi-site-theme", theme);
  }, [theme, themeReady]);
  const [preparing, setPreparing] = useState(false);
  const [projects, setProjects] = useState<SasiProjectSummary[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projectDetail, setProjectDetail] = useState<SasiProjectDetail | null>(null);
  const projectRequestId = useRef<string | null>(null);
  const [skillTab, setSkillTab] = useState<"discover" | "mine" | "create">("discover");
  const [dramaTab, setDramaTab] = useState<"overview" | "continuity" | "shots">("overview");
  const dark = theme === "dark";
  const productionRoute = routeForQuality(quality);
  const quote = useMemo(() => budgetAssessment(productionRoute, seconds, budget), [productionRoute, seconds, budget]);
  const suggestedRoute = routeFor(files, homeBrief);

  async function refreshProjects() {
    if (!accountEmail) {
      setProjects([]);
      setProjectsLoaded(true);
      return;
    }
    setProjectsLoaded(false);
    try {
      const response = await fetch("/api/sasi/projects", { cache: "no-store" });
      const result = response.ok ? await response.json() : { projects: [] };
      setProjects(Array.isArray(result.projects) ? result.projects : []);
    } catch {
      setProjects([]);
    } finally {
      setProjectsLoaded(true);
    }
  }

  async function openProject(projectId: string) {
    setNotice(copy(lang, "正在展开项目图谱…", "Opening project graph…"));
    const response = await fetch(`/api/sasi/projects/${projectId}`, { cache: "no-store" });
    if (!response.ok) {
      setNotice(copy(lang, "项目图谱暂时无法读取。", "The project graph is temporarily unavailable."));
      return;
    }
    setProjectDetail(await response.json());
    setNotice("");
    setView("project");
  }

  useEffect(() => {
    let active = true;
    if (!accountEmail) {
      setProjects([]);
      setProjectsLoaded(true);
      return () => { active = false; };
    }
    setProjectsLoaded(false);
    fetch("/api/sasi/projects", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : { projects: [] })
      .then((result) => { if (active) setProjects(Array.isArray(result.projects) ? result.projects : []); })
      .catch(() => { if (active) setProjects([]); })
      .finally(() => { if (active) setProjectsLoaded(true); });
    return () => { active = false; };
  }, [accountEmail]);

  function addFiles(incoming: File[]) {
    const accepted: StagedFile[] = [];
    const rejected: string[] = [];
    for (const file of incoming) {
      const extension = extensionOf(file.name);
      if (!ACCEPTED_EXTENSIONS.has(extension) || file.size > MAX_FILE_SIZE) {
        rejected.push(file.name);
        continue;
      }
      accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`, name: file.name, size: file.size, kind: classifyFile(file.name), source: file });
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
    if (!accountEmail) {
      setNotice(copy(lang, "请先连接场域账户，再建立可持续保存的真实项目。", "Connect your field account before creating a persistent project."));
      return;
    }
    if (preparing) return;
    setPreparing(true);
    projectRequestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/sasi/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": projectRequestId.current },
        body: JSON.stringify({
          kind,
          language: lang,
          brief: input || copy(lang, "根据已暂存附件建立项目，并进入隔离解析流程。", "Create from staged attachments and begin quarantined inspection."),
          seconds,
          budget,
          quality,
          episodes: episodes ? Number(episodes) : undefined,
          attachments: files.map(({ name, size, kind: fileKind }) => ({ name, size, kind: fileKind })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.error === "SASI_FOUNDATION_NOT_APPLIED") {
          setNotice(copy(lang, "SASI 项目数据层尚未部署。请先应用基础数据库迁移，再重新建立项目。", "The SASI project foundation is not deployed yet. Apply the database migration, then create the project again."));
          return;
        }
        throw new Error(result.error ?? "PROJECT_CREATE_FAILED");
      }
      projectRequestId.current = null;
      setProjects((current) => [result.project, ...current.filter((project) => project.id !== result.project.id)].slice(0, 30));
      let uploadedAssets = 0;
      let reviewAssets = 0;
      if (files.length) {
        const { createClient: createBrowserClient } = await import("@/lib/supabase/client");
        const storage = createBrowserClient().storage;
        for (const file of files) {
          const ticketResponse = await fetch("/api/sasi/assets/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: result.project.id, name: file.name, size: file.size, mime: file.source.type || "application/octet-stream", kind: file.kind }) });
          if (!ticketResponse.ok) continue;
          const ticket = await ticketResponse.json();
          const { error: uploadError } = await storage.from(ticket.bucket).uploadToSignedUrl(ticket.path, ticket.token, file.source, { contentType: ticket.contentType });
          if (uploadError) continue;
          const inspectResponse = await fetch(`/api/sasi/assets/${ticket.assetId}/inspect`, { method: "POST" });
          if (!inspectResponse.ok) continue;
          const inspection = await inspectResponse.json();
          uploadedAssets += 1;
          if (inspection.status === "external_scan_required") reviewAssets += 1;
        }
      }
      if (kind === "drama") {
        const plan = result.recommendation;
        setNotice(copy(lang,
          `项目 ${result.project.id.slice(0, 8)} 已建立：${plan.episodes} 集 × 约 ${plan.secondsPerEpisode} 秒。${uploadedAssets ? `已接收 ${uploadedAssets} 项资产${reviewAssets ? `，其中 ${reviewAssets} 项等待深度安全审阅` : "并完成安全索引"}。` : ""}${result.generationBlocked ? `当前投入边界尚需配置 ${result.quote.gap.toLocaleString()} 制作额度。` : "制作图谱已保存；获得最终授权后才会锁定制作额度。"}`,
          `Project ${result.project.id.slice(0, 8)} is live: ${plan.episodes} episode(s) × about ${plan.secondsPerEpisode}s. ${uploadedAssets ? `${uploadedAssets} asset(s) received${reviewAssets ? `; ${reviewAssets} await deep security review` : " and safely indexed"}. ` : ""}${result.generationBlocked ? `The allocation still needs ${result.quote.gap.toLocaleString()} credits.` : "The production graph is saved; allocation is secured only after final authorization."}`,
        ));
      } else {
        setNotice(copy(lang, `项目 ${result.project.id.slice(0, 8)} 与 ${result.project.nodeCount} 个构建节点已保存。连接仓库后，代码写入和部署仍会分别请求授权。`, `Project ${result.project.id.slice(0, 8)} and ${result.project.nodeCount} build nodes are saved. Repository writes and deployment still require separate authorization.`));
      }
    } catch {
      setNotice(copy(lang, "项目建立失败，当前请求可安全重试。", "Project creation failed; this request can be retried safely."));
    } finally {
      setPreparing(false);
    }
  }

  const shell = dark ? "min-h-screen bg-[#090b0f] text-[#f3f3ef]" : "min-h-screen bg-[#f7f7f3] text-[#171717]";
  const panel = dark ? "border-white/10 bg-white/[.035]" : "border-black/10 bg-white";

  return (
    <div className={`sasi-workspace ${shell}`}>
      <button onClick={() => setMobileNav((value) => !value)} className="fixed left-4 top-4 z-50 rounded-xl border border-current/15 bg-inherit px-3 py-2 text-sm lg:hidden">☰ SASI</button>
      <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto border-r p-4 transition lg:translate-x-0 ${dark ? "border-white/10 bg-[#07111d]" : "border-black/10 bg-white"}`}>
        <button type="button" onClick={() => { setView("home"); setMobileNav(false); }} className="mb-7 flex items-center gap-3 text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="h-10 w-10 rounded-xl" />
          <div><p className="font-display text-lg tracking-[.12em]">灵犀场 SASI</p><p className="text-[10px] uppercase tracking-[.2em] opacity-50">Create · Build · Deliver</p></div>
        </button>

        <p className="mb-2 text-[10px] uppercase tracking-[.22em] opacity-45">SASI Studio</p>
        <nav className="space-y-1">
          {studioNav.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${view === item.id ? (dark ? "border-[#668cff]/25 bg-[#27365d] text-white shadow-[inset_2px_0_#72d7ff]" : "border-[#6958d8]/15 bg-[#e7e9ff] text-[#171717] shadow-[inset_2px_0_#6958d8]") : "border-transparent hover:bg-current/5"}`}>
              <span className="w-7 text-center font-mono text-xs">{item.glyph}</span><span><b className="block text-sm font-medium">{copy(lang, item.zh, item.en)}</b><small className="mt-0.5 block text-[10px] font-normal opacity-48">{item.en}</small></span>
            </button>
          ))}
        </nav>

        <p className="mb-2 mt-7 text-[10px] uppercase tracking-[.22em] opacity-45">{copy(lang, "第二层 · LINGXI FIELD", "SECOND LAYER · LINGXI FIELD")}</p>
        <nav className="space-y-1">
          {fieldNav.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm opacity-70 transition hover:bg-current/5 hover:opacity-100"><span className="w-7 text-center">{item.glyph}</span><span><b className="block text-sm font-medium">{copy(lang, item.zh, item.en)}</b><small className="mt-0.5 block text-[10px] font-normal opacity-48">{item.en}</small></span></Link>)}
        </nav>

        <div className="mt-auto space-y-3 border-t border-current/10 pt-4">
          <div className="flex gap-2"><button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{lang === "zh" ? "EN" : "中文"}</button><button onClick={() => setTheme(dark ? "light" : "dark")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{dark ? "☀ Light" : "☾ Dark"}</button></div>
          <Link href={accountEmail ? "/account" : "/account?next=%2Fsasi"} className="block rounded-xl border border-current/15 px-3 py-3"><p className="truncate text-sm">{accountEmail ?? copy(lang, "连接场域账户", "Connect account")}</p><p className="mt-1 text-[10px] opacity-50">{accountEmail ? copy(lang, "设置 · 切换 · 退出", "Settings · Switch · Sign out") : copy(lang, "登录后同步项目、作品与制作额度", "Sign in to sync projects, works and production allocation")}</p></Link>
        </div>
      </aside>

      <main className="min-h-screen px-4 pb-16 pt-20 lg:ml-[260px] lg:px-5 lg:pt-3">
        <header className="relative mx-auto flex max-w-[1600px] items-center gap-3 border-b border-current/10 pb-3"><label className="hidden min-w-0 flex-1 items-center rounded-full border border-current/15 px-5 py-2.5 md:flex"><span className="mr-3 opacity-45">⌕</span><input value={headerSearch} onChange={(event)=>setHeaderSearch(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"&&headerSearch.trim()){setHomeBrief(headerSearch.trim());setView("home");}}} placeholder={copy(lang,"搜索作品、功能、教程或输入你的想法…","Search works, features, guides or enter an idea…")} className="w-full bg-transparent text-sm outline-none"/></label><button onClick={()=>setView("home")} className="rounded-full border border-[#7994ff]/60 px-5 py-2 text-sm font-semibold">＋ {copy(lang,"创作","Create")}</button><button aria-label={copy(lang,"查看通知","View notifications")} aria-expanded={notificationsOpen} onClick={()=>setNotificationsOpen(value=>!value)} className="relative grid h-10 w-10 place-items-center rounded-full border border-current/10"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.7"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg><i className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff566d] ring-2 ring-[var(--sasi-notice-ring)]"/></button><button onClick={() => setView("account")} className="flex items-center gap-2 rounded-full px-2 py-1 text-sm"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#68d8ff] to-[#7657ff] text-white">◎</span><span className="hidden sm:block">{copy(lang,"探索更大的可能","Explore more")}</span></button>{notificationsOpen&&<aside className={`absolute right-12 top-12 z-30 w-[min(380px,calc(100vw-32px))] rounded-2xl border p-4 shadow-2xl ${panel}`}><div className="flex items-center justify-between"><h2 className="font-semibold">{copy(lang,"公告与更新","News & updates")}</h2><button aria-label={copy(lang,"关闭通知","Close notifications")} onClick={()=>setNotificationsOpen(false)} className="grid h-7 w-7 place-items-center rounded-full border border-current/10 opacity-55">×</button></div><div className="mt-3 space-y-2">{[["作品库已支持导出与安全删除","已上线"],["SASI 首页视觉与入口完成重排","刚刚"],["角色连续性工作台正在构建","进行中"],["真实供应商生成闭环待验证","能力边界"]].map(([title,status])=><div key={title} className="rounded-xl border border-current/[.06] bg-current/[.045] p-3"><p className="text-sm font-medium">{title}</p><span className="mt-1 block text-xs text-[#6b75ff]">{status}</span></div>)}</div></aside>}</header>

        <div className="mx-auto mt-3 max-w-[1600px]">
          {view === "home" && (
            <section className="sasi-home-v4">
              <div className="sasi-home-v4-hero">
                <p className="sasi-home-v4-kicker">LINGXI FIELD · SASI</p>
                <p className="sasi-home-v4-mark">SASI</p>
                <h1>{copy(lang,"把想法，变成真实可用的作品","Turn ideas into work people can use")}</h1>
                <p className="sasi-home-v4-lead">{copy(lang,"一个想法，在这里变成网站、应用、短剧与视频。一键成片，一念即达，一念显化。SASI 贯穿理解、策划、制作、审校与交付，让复杂系统退居幕后。","One idea becomes a website, app, drama or film here. SASI carries it through understanding, direction, production, review and delivery while complexity stays behind the scenes.")}</p>
                <div className="sasi-home-v4-features">{["一键成片","多模态创作","连接你的 API","专业工作流","从想法到上线"].map(item=><span key={item}>◇ {item}</span>)}</div>
                <div className="sasi-home-v4-command"><span>✦</span><input value={homeBrief} onChange={(event)=>setHomeBrief(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter")startFromHome();}} placeholder={copy(lang,"你想创造什么？例如：一个产品官网、一个 AI 应用、一部短剧、一支宣传视频……","What do you want to create—a product site, AI app, drama or campaign film?")}/><button onClick={()=>startFromHome()}>{copy(lang,"开始创作 →","Start creating →")}</button></div>
                <div className="sasi-home-v4-chips">{[["制作短剧","drama"],["构建网站","code"],["生成视频","drama"],["导入剧本","drama"],["设计应用","code"],["创意策划","director"],["连接 API","connections"]].map(([label,target])=><button key={label} onClick={()=>target==="connections"?setView("connections"):target==="director"?setView("director"):startFromHome(target as "drama"|"code")}>{label}</button>)}</div>
              </div>

              <div className="sasi-home-v4-products">{[
                {target:"director",art:"director",zh:"苍玄 AI 导演",en:"CangXuan Director",note:"多类型导演方案，角色一致、剧作可控"},
                {target:"drama",art:"drama",zh:"AI 短剧工坊",en:"AI Drama Studio",note:"从剧本到完整视频，一站式生产"},
                {target:"code",art:"build",zh:"编程构建部署",en:"Build & Deploy",note:"用自然语言构建网站、应用与工具"},
                {target:"skills",art:"skills",zh:"Skills",en:"Skills Marketplace",note:"安装即用的专业能力模块"},
                {target:"connections",art:"api",zh:"模型与 API",en:"Models & API",note:"连接你自己的 AI，费用归属清晰"},
                {target:"billing",art:"billing",zh:"余额与用量",en:"Balance & Usage",note:"成本先看见，真实消耗可追溯"},
                {target:"works",art:"works",zh:"作品库",en:"My Works",note:"管理作品、版本、导出与交付"},
                {target:"account",art:"account",zh:"我的账户",en:"My Account",note:"个人信息、账户安全与授权"},
              ].map(item=><button key={item.target} onClick={()=>setView(item.target as View)} className="sasi-home-v4-product"><span className={`sasi-home-tile-art art-${item.art}`}/><span className="sasi-home-v4-product-copy"><b>{item.zh}</b><small>{item.en}</small><p>{item.note}</p><i>→</i></span></button>)}</div>

              <div className="sasi-home-v4-lower">
                <section><header><h2>▣ {copy(lang,"近期创作作品","Recent works")}</h2><button onClick={()=>setView("works")}>{copy(lang,"查看更多 →","View more →")}</button></header><div className="sasi-home-v4-recent">{(projects.length?projects.slice(0,4):[{id:"demo-1",kind:"drama" as const,title:"《她与星海》",currentVersion:1},{id:"demo-2",kind:"build" as const,title:"未来城市官网",currentVersion:1},{id:"demo-3",kind:"drama" as const,title:"品牌宣传片",currentVersion:1},{id:"demo-4",kind:"build" as const,title:"AI 旅行助手",currentVersion:1}]).map((project,index)=><button key={project.id} onClick={()=>project.id.startsWith("demo-")?setView(project.kind==="drama"?"drama":"code"):openProject(project.id)}><span className={`sasi-home-v4-recent-art recent-${index+1}`}/><b>{project.title}</b><small>{project.id.startsWith("demo-")?copy(lang,"示例模板 · 点击开始","Example · Start here"):project.kind==="drama"?copy(lang,"短剧 · 可继续创作","Drama · Continue"):copy(lang,"数字产品 · 可继续构建","Product · Continue")}</small></button>)}</div></section>
                <section><header><h2>▣ {copy(lang,"创作流程","Creation flow")}</h2></header><ol className="sasi-home-v4-flow">{[["输入想法","描述你的需求"],["SASI 规划","生成方案与执行计划"],["AI 创作","逐步生成、随时调整"],["审校优化","检查质量与一致性"],["交付上线","导出作品与真实状态"]].map(([title,note],index)=><li key={title}><span>{index+1}</span><b>{title}</b><small>{note}</small></li>)}</ol></section>
                <section><header><h2>▣ {copy(lang,"公告与更新","News & updates")}</h2></header><ul className="sasi-home-v4-news"><li><b>作品库项目操作已完成</b><time>09-09</time></li><li><b>构建交付状态链已完成</b><time>09-09</time></li><li><b>模型与 API 安全连接已建立</b><time>09-09</time></li><li><b>短剧角色记忆正在构建</b><time>NEXT</time></li><li><b>真实供应商生成闭环待验证</b><time>GATED</time></li></ul></section>
              </div>
            </section>
          )}

          {view === "project" && projectDetail && (
            <section><button type="button" onClick={() => setView("home")} className="text-sm opacity-55 hover:opacity-100">← {copy(lang, "返回项目列表", "Back to projects")}</button><div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-[#7657ff]">{projectDetail.project.kind === "drama" ? "SASI STORY GRAPH" : "SASI BUILD GRAPH"}</p><h1 className="mt-3 max-w-4xl text-4xl font-semibold">{projectDetail.project.title}</h1><p className="mt-3 font-mono text-xs opacity-35">{projectDetail.project.id}</p></div><span className="rounded-full border border-current/15 px-4 py-2 text-xs">{copy(lang, `版本 ${projectDetail.project.currentVersion}`, `Version ${projectDetail.project.currentVersion}`)}</span></div><div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]"><div><h2 className="text-lg font-semibold">{copy(lang, "生产节点", "Production nodes")} <span className="ml-2 text-xs font-normal opacity-40">{projectDetail.dependencies.length} {copy(lang, "条依赖", "edges")}</span></h2><div className="mt-4 space-y-3">{projectDetail.nodes.map((node, index) => <article key={node.id} className={`flex items-center gap-4 rounded-2xl border p-4 ${panel}`}><span className="font-mono text-xs opacity-30">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{node.type.replaceAll("-", " ")}</p><p className="mt-1 text-[10px] uppercase tracking-[.15em] opacity-40">v{node.version}</p></div><span className={`rounded-full px-3 py-1 text-[10px] ${node.status === "ready" ? "bg-emerald-500/10 text-emerald-600" : "bg-current/5 opacity-55"}`}>{node.status}</span></article>)}</div></div><aside><h2 className="text-lg font-semibold">{copy(lang, "项目资产", "Project assets")}</h2><div className="mt-4 space-y-3">{projectDetail.assets.length === 0 ? <div className={`rounded-2xl border p-5 text-sm leading-6 opacity-50 ${panel}`}>{copy(lang, "尚无云端资产。下一次建立项目时添加文件，SASI 会将其写入隔离区并完成安全分流。", "No cloud assets yet. Add files when creating the next project; SASI will place them in quarantine and route them through inspection.")}</div> : projectDetail.assets.map((asset) => <article key={asset.id} className={`rounded-2xl border p-4 ${panel}`}><p className="truncate text-sm font-medium">{asset.name}</p><div className="mt-3 flex items-center justify-between text-[10px]"><span className="opacity-40">{formatBytes(asset.verifiedSize ?? asset.declaredSize)}</span><span className="uppercase tracking-[.12em] opacity-55">{asset.status.replaceAll("_", " ")}</span></div></article>)}</div></aside></div></section>
          )}

          {view === "project" && projectDetail && <SasiProjectProduction detail={projectDetail} lang={lang} dark={dark} onReload={() => openProject(projectDetail.project.id)} onNotice={setNotice} />}

          {view === "director" && <CangXuanDirectorStudio lang={lang} dark={dark} accountEmail={accountEmail} onEnterProduction={(story) => { setScript(story); setView("drama"); }} />}

          {view === "code" && (
            <section>
              <div className="sasi-v3-page-hero art-build"><p className="sasi-v3-kicker">SASI BUILD</p><h1>{copy(lang, "从需求，到网站真正上线", "From requirement to a live product")}</h1><p>{copy(lang, "从一句需求、页面截图、报错日志或现有项目进入真实仓库工作流。SASI 区分代码完成、Git 提交、部署成功和公网可访问，不用一句“已上线”掩盖中间状态。", "Start from a brief, screenshot, error log or existing project. SASI distinguishes code completion, Git commit, deployment and public availability instead of hiding them behind one vague ‘live’ state.")}</p><strong>{copy(lang,"规划、编程、测试、审校与部署，都留下可以核验的证据。","Planning, coding, testing, review and deployment leave verifiable evidence.")}</strong></div>
              <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className={`rounded-3xl border p-6 ${panel}`}><textarea value={brief} onChange={(event) => setBrief(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "描述产品、错误、现有仓库与部署目标……", "Describe the product, problem, repository and deployment target…")} className="min-h-40 w-full resize-none bg-transparent text-base leading-7 outline-none"/><UploadHub lang={lang} files={files} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onNotice={setNotice} onOpenConnections={()=>setView("connections")} /><div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs opacity-55">SASI Auto · {copy(lang, "快速 / 标准 / 深度", "Fast / Standard / Deep")}</span><button disabled={preparing} onClick={() => prepare("code")} className={`rounded-xl px-7 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-50 ${dark ? "bg-white text-black" : "bg-black text-white"}`}>{preparing ? copy(lang, "正在建立项目…", "Creating project…") : copy(lang, "建立真实项目", "Create project")}</button></div></div>
                <aside className={`rounded-3xl border p-5 ${panel}`}><p className="text-xs uppercase tracking-[.18em] text-[#6d70ff]">REPOSITORY & DEPLOY</p><h2 className="mt-3 text-lg font-semibold">{copy(lang,"连接后读取真实状态","Connect for live status")}</h2><p className="mt-3 text-xs leading-6 opacity-55">{copy(lang,"GitHub 用于仓库、分支与提交；Vercel 用于构建、域名与部署结果。未连接时不会伪造成功记录。","GitHub provides repositories, branches and commits; Vercel provides builds, domains and deployment results. No success records are fabricated before connection.")}</p><div className="mt-5 space-y-2">{[["GitHub",copy(lang,"仓库与提交证据","Repository & commit evidence")],["Vercel",copy(lang,"构建与公网状态","Build & public status")]].map(([name,note])=><button key={name} onClick={()=>setView("connections")} className="flex w-full items-center justify-between rounded-xl border border-current/10 px-4 py-3 text-left"><span><b className="block text-xs">{name}</b><small className="mt-1 block opacity-45">{note}</small></span><span className="text-[#6d70ff]">＋</span></button>)}</div></aside>
              </div>
              <div className="mt-6"><div className="flex items-end justify-between gap-4"><div><p className="sasi-v3-kicker">DELIVERY EVIDENCE</p><h2 className="mt-2 text-2xl font-semibold">{copy(lang,"从构建到上线的状态链","Evidence from build to live")}</h2></div><span className="text-xs opacity-45">{copy(lang,"连接后自动更新","Updates after connection")}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["01","代码与审阅", "本地变更、检查结果、风险说明"],["02","Git 提交","提交哈希、目标分支、推送结果"],["03","部署构建","部署编号、构建日志、运行状态"],["04","公网验证","域名响应、版本证据、可访问时间"]].map(([step,title,note])=><article key={step} className={`rounded-2xl border p-5 ${panel}`}><span className="text-xs text-[#6d70ff]">{step}</span><h3 className="mt-3 font-semibold">{copy(lang,title,title)}</h3><p className="mt-2 text-xs leading-5 opacity-50">{copy(lang,note,note)}</p><span className="mt-4 inline-flex rounded-full bg-current/5 px-3 py-1 text-[10px] opacity-45">{copy(lang,"等待项目执行","Awaiting project run")}</span></article>)}</div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">{SASI_SKILLS.filter((skill) => (skill.modes as readonly string[]).includes("code")).map((skill) => <div key={skill.id} className="rounded-2xl border border-current/10 p-5"><p className="font-medium"><span className="mr-2 text-[#7657ff]">{skill.glyph}</span>{copy(lang, skill.zh, skill.en)}</p><p className="mt-2 text-xs leading-5 opacity-55">{copy(lang, skill.noteZh, skill.noteEn)}</p></div>)}</div>
              {projects.some((project)=>project.kind==="build") && <div className="mt-8"><div className="flex items-end justify-between"><h2 className="text-2xl font-semibold">{copy(lang,"最近的构建项目","Recent build projects")}</h2><button onClick={()=>setView("works")} className="text-xs text-[#6d70ff]">{copy(lang,"查看全部 →","View all →")}</button></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.filter((project)=>project.kind==="build").slice(0,3).map(project=><button key={project.id} onClick={()=>openProject(project.id)} className={`rounded-2xl border p-5 text-left ${panel}`}><span className="text-[10px] uppercase tracking-[.16em] text-[#6d70ff]">BUILD GRAPH</span><h3 className="mt-3 truncate font-semibold">{project.title}</h3><p className="mt-2 text-xs opacity-45">v{project.currentVersion} · {copy(lang,"打开真实项目图谱","Open persisted project graph")}</p></button>)}</div></div>}
            </section>
          )}

          {view === "drama" && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e04d70]">SASI DRAMA</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{copy(lang, "从任意素材，到可逐步修改的成片工作流", "From any source to an editable production workflow")}</h1>
              <p className="mt-4 max-w-4xl text-base leading-8 opacity-60">{copy(lang,"不是只生成一个漂亮镜头，而是让人物、剧情、场景和声音在整部作品里持续成立。","Go beyond one beautiful shot—keep characters, story, setting and sound coherent across the whole work.")}</p>
              <div className="mt-6 flex flex-wrap gap-2">{[["overview","项目总览"],["continuity","人物与连续性"],["shots","分镜与镜头生产"]].map(([id,label])=><button key={id} onClick={()=>setDramaTab(id as typeof dramaTab)} className={`rounded-full px-4 py-2 text-sm ${dramaTab===id?"bg-[#e04d70] text-white":"border border-current/15"}`}>{copy(lang,label,id)}</button>)}</div>
              {dramaTab === "overview" && <>
              <div className="mt-6 flex flex-wrap gap-2">{[["我只有一个想法", "I have an idea"], ["我有完整剧本", "I have a script"], ["我有小说 / 故事", "I have a novel"], ["我已经有角色", "I have characters"], ["我已有故事板", "I have storyboards"], ["只生成一个镜头", "Generate one shot"]].map(([zh, en]) => <button key={zh} type="button" onClick={() => setScript(copy(lang, zh, en))} className="rounded-full border border-current/15 px-4 py-2 text-xs hover:border-[#e04d70]">{copy(lang, zh, en)}</button>)}</div>
              <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className={`rounded-3xl border p-6 ${panel}`}><textarea value={script} onChange={(event) => setScript(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "写下创意，或导入剧本、小说、人物图、故事板、音频和已有视频……", "Write an idea or import a script, novel, character image, storyboard, audio or existing video…")} className="min-h-36 w-full resize-none bg-transparent text-base leading-7 outline-none"/><UploadHub lang={lang} files={files} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onNotice={setNotice} /><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs opacity-60">{copy(lang, "目标总时长（5–600秒）", "Total duration (5–600 sec)")}<input type="number" min={5} max={600} value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "集数（留空由 SASI 建议）", "Episodes (optional)")}<input type="number" min={1} max={200} value={episodes} onChange={(event) => setEpisodes(event.target.value)} placeholder={copy(lang, "动态分析，不预设", "Dynamic, not preset")} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "项目投入边界（制作额度）", "Project allocation (credits)")}<input type="number" min={0} step="100" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "制作规格", "Production grade")}<select value={quality} onChange={(event) => setQuality(event.target.value as SasiQuality)} className={`mt-2 w-full rounded-xl border border-current/15 px-3 py-3 text-base outline-none ${dark ? "bg-[#11151b]" : "bg-white"}`}>{SASI_QUALITY_TIERS.map((item) => <option key={item.id} value={item.id}>{copy(lang, item.zh, item.en)}</option>)}</select></label></div><p className="mt-4 text-xs leading-5 opacity-50">{copy(lang, "SASI Auto 将按叙事价值调度制作能力；无需选择模型或管理技术账户。", "SASI Auto allocates production capability by narrative value; no model or technical account selection is required.")}</p><button disabled={preparing} onClick={() => prepare("drama")} className="mt-6 w-full rounded-xl bg-[#e04d70] py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50">{preparing ? copy(lang, "正在建立项目…", "Creating project…") : copy(lang, "建立项目并形成提案", "Create project & proposal")}</button></div>
                <div className={`rounded-3xl p-6 ${dark ? "bg-[#d9ff73] text-black" : "bg-[#151515] text-white"}`}><p className="text-xs uppercase tracking-[.2em] opacity-55">PRODUCTION ENVELOPE</p><p className="mt-5 text-3xl font-semibold">{quote.points.toLocaleString()} <span className="text-sm font-normal opacity-50">{copy(lang, "制作额度", "credits")}</span></p><p className="mt-1 text-sm opacity-60">{seconds}s · {copy(lang, SASI_QUALITY_TIERS.find((tier) => tier.id === quality)?.zh ?? "灵感验证", SASI_QUALITY_TIERS.find((tier) => tier.id === quality)?.en ?? "Concept")}</p><div className="my-5 border-t border-current/15"/><p className="text-sm">{copy(lang, "SASI Auto · 智能统筹", "SASI Auto · intelligent orchestration")}</p><dl className="mt-5 space-y-2 text-xs"><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "建议制作额度", "Proposed allocation")}</dt><dd>{quote.points.toLocaleString()}</dd></div><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "投入边界", "Allocation boundary")}</dt><dd>{quote.budget.toLocaleString()}</dd></div><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "尚需配置", "Remaining allocation")}</dt><dd>{quote.gap.toLocaleString()}</dd></div></dl><div className={`mt-5 rounded-xl p-3 text-xs leading-5 ${quote.canConfirm ? "bg-emerald-500/15" : "bg-amber-500/20"}`}>{quote.canConfirm ? copy(lang, `当前投入边界支持本次制作。最终授权后，最多锁定 ${quote.points.toLocaleString()} 制作额度。`, `The current allocation supports this production. Final authorization secures no more than ${quote.points.toLocaleString()} credits.`) : copy(lang, "当前投入边界与制作规格尚未对齐。可调整时长、镜头策略或制作规格，系统会重新推演。", "The allocation and production grade are not yet aligned. Adjust duration, shot strategy or grade for a new study.")}</div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><button className="rounded-lg border border-current/15 py-2" onClick={() => setBudget(quote.points)}>{copy(lang, "对齐投入边界", "Align allocation")}</button><button className="rounded-lg border border-current/15 py-2" onClick={() => setSeconds(Math.max(5, Math.floor(seconds * .7)))}>{copy(lang, "重构篇幅", "Refine duration")}</button></div></div>
              </div>
              <div className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{copy(lang, "可逐幕审阅的制作链", "A production chain reviewed scene by scene")}</h2><span className="text-xs opacity-45">{copy(lang, "每一步都保留创作主权", "Creative control at every stage")}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(lang === "zh" ? workflowZh : workflowEn).map((item, index) => <div key={item} className="rounded-2xl border border-current/10 p-4"><p className="text-xs opacity-35">{String(index + 1).padStart(2, "0")}</p><p className="mt-3 text-sm font-medium">{item}</p><p className="mt-2 text-[11px] opacity-45">{index < 3 ? copy(lang, "分析后可修改", "Editable after analysis") : copy(lang, "生成、编辑或重做", "Generate, edit or redo")}</p></div>)}</div></div>
              <div className="mt-7 rounded-3xl border border-current/10 p-6"><p className="text-xs uppercase tracking-[.2em] text-[#e04d70]">{copy(lang, "典藏级关键镜头", "Signature key shots")}</p><p className="mt-3 leading-7 opacity-65">{copy(lang, "SASI 会把最高制作规格集中于人物登场、高潮、战斗与情绪特写，并为承接叙事的镜头匹配恰当方案；每次调整都会先呈现作品表现与制作额度的变化。", "SASI concentrates the highest production grade on entrances, climaxes, action and emotional close-ups, then assigns the right approach to supporting shots. Every revision reveals its impact on creative finish and production allocation first.")}</p></div>
              </>}
              {dramaTab === "continuity" && <DramaVisualWorkspace lang={lang} dark={dark} mode="continuity" />}
              {dramaTab === "shots" && <DramaVisualWorkspace lang={lang} dark={dark} mode="shots" />}
            </section>
          )}

          {view === "skills" && (
            <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">CAPABILITY LIBRARY</p><h1 className="mt-3 text-4xl font-semibold">{copy(lang, "把成熟方法沉淀为可复用的专业能力", "Turn proven methods into reusable professional capability")}</h1><div className="mt-6 flex flex-wrap gap-2">{[["discover", "探索能力", "Discover"], ["mine", "我的能力", "My capabilities"], ["create", "编制与发布", "Author & publish"]].map(([id, zh, en]) => <button key={id} onClick={() => setSkillTab(id as typeof skillTab)} className={`rounded-full px-4 py-2 text-sm ${skillTab === id ? "bg-[#7657ff] text-white" : "border border-current/15"}`}>{copy(lang, zh, en)}</button>)}</div>{skillTab === "discover" ? <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SASI_SKILLS.map((skill, index) => <article key={skill.id} className={`rounded-3xl border p-6 ${panel}`}><span className="text-2xl text-[#7657ff]">{skill.glyph}</span><h2 className="mt-5 text-lg font-semibold">{copy(lang, skill.zh, skill.en)}</h2><p className="mt-3 text-sm leading-6 opacity-55">{copy(lang, skill.noteZh, skill.noteEn)}</p><p className="mt-5 text-sm font-semibold">{index < 3 ? copy(lang, "基础能力 · 已纳入", "Core · Included") : copy(lang, "专业能力 · 即将开放", "Signature · Coming soon")}</p></article>)}</div> : <div className={`mt-7 rounded-3xl border p-7 ${panel}`}><h2 className="text-2xl font-semibold">{skillTab === "mine" ? copy(lang, "我的能力组合", "My capability set") : copy(lang, "编制并发布专业能力", "Author and publish a capability")}</h2><p className="mt-4 max-w-2xl leading-7 opacity-60">{copy(lang, "创作者能力开放前，将先完成隔离运行、权限说明、来源验证与专业审阅。未来每项能力都以适用场景、交付标准与使用授权呈现，而不是以低价工具陈列。", "Creator capabilities open after isolated execution, permission disclosure, provenance checks and professional review. Each capability will be presented by fit, delivery standard and usage license—not as a bargain tool listing.")}</p><button onClick={() => setNotice(copy(lang, "隔离运行与专业审阅体系就绪后，将开放创作者提交。", "Creator submissions open after isolated execution and professional review are ready."))} className="mt-6 rounded-xl border border-current/20 px-5 py-3 text-sm">{copy(lang, "查看准入标准", "View admission standard")}</button></div>}</section>
          )}

          {view === "connections" && <ConnectionCenter lang={lang} dark={dark} accountEmail={accountEmail} />}

          {view === "billing" && <SasiProductionAccount lang={lang} dark={dark} accountEmail={accountEmail} onNotice={setNotice} />}

          {view === "works" && <SasiWorkLibrary lang={lang} dark={dark} projects={projects} loaded={projectsLoaded} onOpen={openProject} onRefresh={refreshProjects} onCreate={(target,preset)=>{ if(preset){ setHomeBrief(preset); if(target==="drama") setScript(preset); if(target==="code") setBrief(preset); if(target==="director") window.localStorage.setItem("cangxuan-director-draft-v1",JSON.stringify({title:"",premise:preset,protagonist:"",mode:"motion-comic",genre:"古装复仇",episodes:24,secondsPerEpisode:60})); } setView(target); }} />}

          {view === "account" && <SasiAccountCenter lang={lang} dark={dark} accountEmail={accountEmail} onOpenBilling={()=>setView("billing")} onOpenModels={()=>setView("connections")} />}

          {view !== "home" && <footer className="mt-16 border-t border-current/10 py-8"><p className="text-xs uppercase tracking-[.2em] opacity-40">{copy(lang, "法律与规则", "Legal & Rules")}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{(lang === "zh" ? legalZh : legalEn).map((label) => <Link key={label} href="/legal/sasi" className="text-xs opacity-55 hover:opacity-100">{label}</Link>)}</div><p className="mt-6 max-w-4xl text-xs leading-6 opacity-40">{copy(lang, "SASI 专注于作品生产与交付，不运营内容发布社区。真实制作、制作账户、创作者能力与云端资产将在相应安全和结算体系就绪后分阶段开放。", "SASI focuses on production and delivery rather than operating a publishing community. Live production, production accounts, creator capabilities and cloud assets open in stages after their safety and settlement systems are ready.")}</p></footer>}
        </div>
      </main>

      {notice && <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border p-4 text-sm shadow-2xl ${dark ? "border-white/15 bg-[#151922]" : "border-black/10 bg-white"}`}><button onClick={() => setNotice("")} className="float-right ml-4 opacity-45">×</button>{notice}</div>}
    </div>
  );
}
