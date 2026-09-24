"use client";

import Link from "next/link";
import { SASI_MAX_UPLOAD_BYTES } from "@/lib/sasi/upload-policy";
import { uploadSasiAsset } from "@/lib/sasi/upload-client";
import Image from "next/image";
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
  routeForQuality,
  SASI_QUALITY_TIERS,
  SASI_SKILLS,
  type SasiQuality,
} from "@/lib/sasi/catalog";
import { SasiComposer } from "./SasiComposer";
import { SasiProjectMemory } from "./SasiProjectMemory";
import { SASI_UPDATES } from "@/lib/sasi/updates";
import { SasiProductionAccount, SasiProjectProduction } from "@/app/sasi/SasiProductionPanels";
import CangXuanDirectorStudio from "@/app/sasi/CangXuanDirectorStudio";
import ConnectionCenter from "@/app/sasi/ConnectionCenter";
import { DramaOverviewConsole, DramaVisualWorkspace, SasiAccountCenter, SasiWorkLibrary } from "@/app/sasi/SasiV3Panels";

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
  jobs: { id: string; status: string; canCancel: boolean; quotedAmountFen: number; reservedAmountFen: number; settledAmountFen: number; errorCode: string | null; input: Record<string, unknown>; createdAt: string }[];
  deliveries: { id: string; jobId: string; mimeType: string; byteSize: number; aiGenerated: boolean; createdAt: string }[];
};


const formatRmb = (fen: number) => `¥${(fen / 100).toFixed(2)}`;
const ACCEPTED_EXTENSIONS = new Set([
  "txt", "md", "docx", "pdf", "csv", "json", "yaml", "yml",
  "jpg", "jpeg", "png", "webp", "heic", "gif",
  "mp3", "wav", "m4a", "aac", "mp4", "mov", "webm",
  "zip", "js", "jsx", "ts", "tsx", "css", "html", "sql", "py", "go", "rs", "java",
]);

const studioNav: { id: View; zh: string; en: string; glyph: string }[] = [
  { id: "home", zh: "新建创作", en: "New project", glyph: "＋" },
  { id: "works", zh: "我的项目", en: "My projects", glyph: "▣" },
  { id: "skills", zh: "创作 Skills", en: "Skills", glyph: "◇" },
  { id: "connections", zh: "连接与 API", en: "Connections", glyph: "⌁" },
  { id: "billing", zh: "充值与账单", en: "Balance & billing", glyph: "◎" },
];

const fieldNav = [
  { href: "/ai-knowledge", zh: "书本 SASI", en: "Book SASI", glyph: "▣" },
  { href: "/ai-learning", zh: "学习 SASI", en: "Learning SASI", glyph: "◫" },
  { href: "/ai-research", zh: "科研 SASI", en: "Research SASI", glyph: "⌕" },
  { href: "/account", zh: "我的账户", en: "My Account", glyph: "○" },
]

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
  maxFileBytes,
}: {
  lang: Lang;
  files: StagedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onNotice: (message: string) => void;
  onOpenConnections?: () => void;
  maxFileBytes: number;
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
          <button type="button" onClick={() => onOpenConnections ? onOpenConnections() : onNotice(copy(lang,"请从左侧能力中枢打开 GitHub 与部署连接指引。","Open Capability Center from the sidebar for GitHub and deployment setup."))} className="rounded-full border border-current/15 px-3 py-2 text-xs opacity-70">GitHub · {copy(lang,"连接指引","Setup")}</button>
          <span className="text-xs opacity-45">{copy(lang, `拖拽或粘贴图片 · 当前单文件上限 ${formatBytes(maxFileBytes)}`, `Drag or paste images · Current file limit ${formatBytes(maxFileBytes)}`)}</span>
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
      <p className="mt-2 text-sm leading-6 opacity-60">{copy(lang, "文件会先在本次浏览器任务中暂存；建立项目后才进入私有隔离通道，完成归属校验与安全索引。任何代码都不会被自动执行。", "Files are staged in this browser task first. Only after project creation do they enter a private quarantine channel for ownership checks and safe indexing. Code is never auto-executed.")}</p>
    </div>
  );
}

function BuildDeployConsole({
  maxFileBytes,
  lang,
  dark,
  accountEmail,
  brief,
  setBrief,
  files,
  addFiles,
  removeFile,
  handlePaste,
  preparing,
  prepareProject,
  projects,
  openProject,
  openConnections,
  setNotice,
}: {
  lang: Lang;
  dark: boolean;
  accountEmail: string | null;
  brief: string;
  setBrief: (value: string) => void;
  files: StagedFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  handlePaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  preparing: boolean;
  maxFileBytes: number;
  prepareProject: () => void;
  projects: SasiProjectSummary[];
  openProject: (projectId: string) => void;
  openConnections: () => void;
  setNotice: (message: string) => void;
}) {
  const buildProjects = projects.filter((project) => project.kind === "build");
  const latestProject = buildProjects[0] ?? null;
  const hasInput = brief.trim().length >= 12 || files.length > 0;
  const statusItems = [
    { name: "GitHub", note: copy(lang, "读取仓库、分支与提交", "Repository, branch and commits") },
    { name: "Vercel", note: copy(lang, "读取构建、预览与公网部署", "Builds, previews and production") },
    { name: "Supabase", note: copy(lang, "读取项目数据库与迁移状态", "Project database and migrations") },
    { name: copy(lang, "自定义域名", "Custom domain"), note: copy(lang, "验证 DNS、SSL 与公网响应", "DNS, SSL and public response") },
  ];
  const deliverySteps = [
    ["01", copy(lang, "理解需求", "Understand"), copy(lang, "目标、用户、边界与验收标准", "Goals, users, boundaries and acceptance"), hasInput ? copy(lang, "可规划", "Ready to plan") : copy(lang, "等待需求", "Awaiting brief")],
    ["02", copy(lang, "形成方案", "Plan"), copy(lang, "页面、功能、数据与实施顺序", "Pages, features, data and sequence"), latestProject ? copy(lang, "项目已保存", "Project saved") : copy(lang, "尚未执行", "Not run")],
    ["03", copy(lang, "代码与审阅", "Code & review"), copy(lang, "变更、测试、风险与审阅结论", "Changes, tests, risks and review"), copy(lang, "等待执行", "Awaiting run")],
    ["04", copy(lang, "提交与上线", "Commit & launch"), copy(lang, "Git、构建、域名与公网证据", "Git, build, domain and public evidence"), copy(lang, "等待授权", "Awaiting approval")],
  ];

  return (
    <section className={`sasi-build-console ${dark ? "is-dark" : "is-light"}`}>
      <header className="sasi-build-heading">
        <div>
          <p>LINGXI FIELD · SASI BUILD</p>
          <h1>{copy(lang, "编程构建部署", "Build & Deploy")}</h1>
          <strong>{copy(lang, "从一句需求，到产品真正上线。", "From one requirement to a product that is truly live.")}</strong>
          <span>{copy(lang, "SASI 把模糊想法拆成可执行任务，组织代码、测试与交付；每一步有状态，每个结果有证据。", "SASI turns an unclear idea into executable work, then organizes code, tests and delivery with a status and evidence for every result.")}</span>
        </div>
        <button type="button" onClick={() => document.getElementById("sasi-build-brief")?.focus()}>＋ {copy(lang, "新建项目", "New project")}</button>
      </header>

      <div className="sasi-build-project-bar">
        <div><small>{copy(lang, "当前项目", "Current project")}</small><b>{latestProject?.title ?? copy(lang, "尚未建立项目", "No project yet")}</b>{latestProject && <button type="button" onClick={() => openProject(latestProject.id)}>{copy(lang, `打开 V${latestProject.currentVersion}`, `Open V${latestProject.currentVersion}`)} →</button>}</div>
        <div className="sasi-build-integrations">
          {statusItems.map((item) => <button type="button" key={item.name} onClick={openConnections}><span><b>{item.name}</b><small>{item.note}</small></span><em>{copy(lang, "待连接", "Connect")}</em></button>)}
        </div>
      </div>

      <div className="sasi-build-grid">
        <section className="sasi-build-panel sasi-build-demand">
          <header><div><small>01 · BRIEF</small><h2>{copy(lang, "需求与任务", "Brief & tasks")}</h2></div><span>{hasInput ? copy(lang, "可以开始规划", "Ready to plan") : copy(lang, "先说清要解决什么", "Start with the problem")}</span></header>
          <textarea id="sasi-build-brief" value={brief} onChange={(event) => setBrief(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "例如：根据这张页面截图重做首页；保留已有登录和数据库；适配手机端；测试通过后提交，但部署前先让我确认。", "Example: Rebuild the homepage from this screenshot, preserve login and data, support mobile, test and commit, then ask before deployment.")} />
          <p className="sasi-build-guidance">{copy(lang, "写清用户、问题、必须保留的内容和完成标准，SASI 才能少走弯路。截图、报错、文档或代码可以直接附上。", "Name the user, problem, must-keep elements and acceptance criteria. Attach screenshots, errors, documents or code directly.")}</p>
          <UploadHub maxFileBytes={maxFileBytes} lang={lang} files={files} onAdd={addFiles} onRemove={removeFile} onNotice={setNotice} onOpenConnections={openConnections} />
          <button type="button" disabled={preparing} onClick={prepareProject} className="sasi-build-primary">{preparing ? copy(lang, "正在建立项目…", "Creating project…") : copy(lang, "建立项目并生成执行图谱", "Create project & execution graph")}</button>
          {!accountEmail && <p className="sasi-build-boundary">{copy(lang, "建立可持续保存的项目需要先登录；当前输入与附件只保留在本次浏览器任务中。", "Sign in to persist a project. The current brief and files remain in this browser task only.")}</p>}
          <div className="sasi-build-plan"><h3>{copy(lang, "交付路径", "Delivery path")}</h3>{deliverySteps.map(([number, title, note, status]) => <article key={number}><i>{number}</i><div><b>{title}</b><small>{note}</small></div><em>{status}</em></article>)}</div>
        </section>

        <section className="sasi-build-panel sasi-build-files">
          <header><div><small>02 · SOURCE</small><h2>{copy(lang, "代码与文件", "Code & files")}</h2></div><span>{files.length ? copy(lang, `${files.length} 项待归属`, `${files.length} staged`) : copy(lang, "尚无来源", "No source yet")}</span></header>
          <div className="sasi-build-source-head"><b>{copy(lang, "项目来源", "Project source")}</b><span>{copy(lang, "连接后才读取真实内容", "Live content appears after connection")}</span></div>
          {files.length > 0 ? <div className="sasi-build-file-list">{files.map((file) => <article key={file.id}><span className="sasi-build-file-icon">{file.kind === "code" ? "</>" : "▧"}</span><div><b>{file.name}</b><small>{file.kind} · {formatBytes(file.size)}</small></div><button type="button" onClick={() => removeFile(file.id)} aria-label={copy(lang, "移除文件", "Remove file")}>×</button></article>)}</div> : <div className="sasi-build-empty"><span>⌘</span><h3>{copy(lang, "从真实材料开始", "Start from real material")}</h3><p>{copy(lang, "连接 GitHub 读取仓库，或在左侧上传现有代码、页面截图和报错日志。没有来源时，系统不会展示虚构的文件树。", "Connect GitHub to read a repository, or upload code, screenshots and error logs. No fictional file tree is shown without a source.")}</p><button type="button" onClick={openConnections}>{copy(lang, "连接 GitHub", "Connect GitHub")} →</button></div>}
          <div className="sasi-build-truth"><h3>{copy(lang, "完成标准", "Definition of done")}</h3><ul><li>{copy(lang, "修改内容与原需求逐项对应", "Changes map to the brief")}</li><li>{copy(lang, "类型、构建与关键流程通过检查", "Types, build and key flows verified")}</li><li>{copy(lang, "用户原有功能与数据不被破坏", "Existing features and data preserved")}</li><li>{copy(lang, "提交、部署与公网验证分别记录", "Commit, deployment and public checks recorded separately")}</li></ul></div>
        </section>

        <aside className="sasi-build-panel sasi-build-release">
          <header><div><small>03 · RELEASE</small><h2>{copy(lang, "部署与域名", "Deploy & domain")}</h2></div><span>{copy(lang, "等待连接", "Awaiting connection")}</span></header>
          <p className="sasi-build-release-lead">{copy(lang, "代码完成不等于已经上线。这里分别核对预览、生产、数据库和域名，避免“看似完成，却无法访问”。", "Code complete is not live. Preview, production, database and domain are verified separately so finished-looking work does not fail in public.")}</p>
          <div className="sasi-build-release-list">{[["Preview", copy(lang, "预览构建与页面验收", "Preview build and visual review")],["Production", copy(lang, "生产构建与版本证据", "Production build and version evidence")],["Database", copy(lang, "迁移、权限与服务健康", "Migrations, access and service health")],["DNS / SSL", copy(lang, "域名解析、证书与响应", "DNS, certificate and response")]].map(([title, note]) => <button type="button" key={title} onClick={openConnections}><span><b>{title}</b><small>{note}</small></span><em>{copy(lang, "待验证", "Verify")}</em></button>)}</div>
          <div className="sasi-build-checks"><h3>{copy(lang, "上线检查", "Launch checks")}</h3>{[copy(lang, "环境变量完整且不暴露密钥", "Environment variables complete and secret"),copy(lang, "数据库迁移与权限已经核验", "Database migrations and access verified"),copy(lang, "生产构建无错误", "Production build succeeds"),copy(lang, "域名响应与版本一致", "Domain response matches the release")].map(item => <p key={item}><span>○</span>{item}</p>)}</div>
          <button type="button" onClick={openConnections} className="sasi-build-secondary">{copy(lang, "配置连接与部署入口", "Configure connections & deployment")}</button>
          <p className="sasi-build-boundary">{copy(lang, "部署属于外部写入操作。连接完成后仍会在执行前请求确认。", "Deployment is an external write and still requires confirmation after connections are ready.")}</p>
        </aside>
      </div>

      {buildProjects.length > 0 && <section className="sasi-build-recent"><header><div><small>RECENT PROJECTS</small><h2>{copy(lang, "继续已有构建", "Continue a build")}</h2></div></header><div>{buildProjects.slice(0,4).map((project) => <button type="button" key={project.id} onClick={() => openProject(project.id)}><span>◇</span><div><b>{project.title}</b><small>V{project.currentVersion} · {copy(lang, "已保存项目图谱", "Saved project graph")}</small></div><em>→</em></button>)}</div></section>}
    </section>
  );
}

function SkillsMarketplace({
  lang,
  dark,
  activeTab,
  setActiveTab,
  openView,
  setNotice,
}: {
  lang: Lang;
  dark: boolean;
  activeTab: "discover" | "mine" | "create";
  setActiveTab: (tab: "discover" | "mine" | "create") => void;
  openView: (view: View) => void;
  setNotice: (message: string) => void;
}) {
  const [category, setCategory] = useState("all");
  const categories = [
    ["all", "全部", "All"], ["director", "导演", "Director"], ["drama", "短剧", "Drama"],
    ["code", "编程", "Code"], ["prompt", "提示词", "Prompts"], ["review", "审校", "Review"],
    ["deploy", "部署", "Deploy"], ["assets", "素材", "Assets"],
  ] as const;
  const visibleSkills = SASI_SKILLS.filter((skill) => activeTab === "mine" ? skill.status === "enabled" : category === "all" || skill.category === category);

  function activateSkill(skill: (typeof SASI_SKILLS)[number]) {
    if (skill.status !== "enabled") {
      setNotice(copy(lang, `${skill.zh}仍在能力验证阶段，当前可查看规划，但不能作为已安装能力执行。`, `${skill.en} is still being validated. Its plan is visible, but it cannot run as an installed capability yet.`));
      return;
    }
    if (skill.id === "deployment-guardian") openView("code");
    else openView((skill.modes as readonly string[]).includes("code") ? "code" : "drama");
    setNotice(copy(lang, `已带着“${skill.zh}”的工作方法进入对应工作流；外部写入与部署仍需单独确认。`, `Opened the matching workflow with ${skill.en}; external writes and deployment still require separate confirmation.`));
  }

  return (
    <section className={`sasi-skills-market ${dark ? "is-dark" : "is-light"}`}>
      <header className="sasi-skills-heading">
        <div><p>LINGXI FIELD · SASI SKILLS</p><h1>Skills</h1><strong>{copy(lang, "把成熟方法，变成随时可调用的专业能力。", "Turn proven methods into professional capability on demand.")}</strong><span>{copy(lang, "不必每次从零摸索。为导演、短剧、网站构建与内容交付调用经过整理的方法，让复杂工作有步骤、有标准、有结果。", "Stop rebuilding the method from scratch. Bring structured expertise into directing, drama, product building and delivery—with steps, standards and outcomes.")}</span></div>
        <div className="sasi-skills-heading-proof"><b>{SASI_SKILLS.filter((skill) => skill.status === "enabled").length}</b><span>{copy(lang, "项内置流程已可进入", "built-in flows available")}</span><small>{copy(lang, "其余能力明确标注为规划中", "Everything else is clearly marked as planned")}</small></div>
      </header>

      <nav className="sasi-skills-tabs" aria-label={copy(lang, "Skills 页面", "Skills sections")}>{([[
        "discover", "探索能力", "Discover"], ["mine", "我的能力", "My capabilities"], ["create", "编制与发布", "Author & publish"]] as const).map(([id, zh, en]) => <button type="button" key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "active" : ""}>{copy(lang, zh, en)}{id === "mine" && <em>{SASI_SKILLS.filter((skill) => skill.status === "enabled").length}</em>}</button>)}</nav>

      {activeTab !== "create" && <>
        {activeTab === "discover" && <div className="sasi-skills-filters">{categories.map(([id, zh, en]) => <button type="button" key={id} onClick={() => setCategory(id)} className={category === id ? "active" : ""}>{copy(lang, zh, en)}</button>)}</div>}
        <div className="sasi-skills-summary"><div><small>{activeTab === "mine" ? "MY CAPABILITIES" : "CAPABILITY LIBRARY"}</small><h2>{activeTab === "mine" ? copy(lang, "已经可以使用的能力", "Capabilities ready to use") : copy(lang, "按你要解决的问题选择能力", "Choose by the problem you need to solve")}</h2></div><p>{activeTab === "mine" ? copy(lang, "这些能力已经进入 SASI 内置工作流，不代表外部部署或付费调用已被自动授权。", "These capabilities are built into SASI workflows; external deployment and paid calls are not automatically authorized.") : copy(lang, "每张卡片说明它解决什么、适合哪里以及当前是否可用。", "Each card explains the problem, fit and real availability.")}</p></div>
        <div className="sasi-skills-grid">{visibleSkills.map((skill) => <article key={skill.id} className={skill.status === "enabled" ? "is-enabled" : "is-planned"}>
          <header><span>{skill.glyph}</span><em>{copy(lang, skill.category === "code" ? "编程" : skill.category === "deploy" ? "部署" : skill.category === "director" ? "导演" : skill.category === "drama" ? "短剧" : skill.category === "prompt" ? "提示词" : skill.category === "review" ? "审校" : "素材", skill.category)}</em></header>
          <h3>{copy(lang, skill.zh, skill.en)}</h3><small>{skill.en}</small><p>{copy(lang, skill.noteZh, skill.noteEn)}</p><dl><dt>{copy(lang, "适用于", "Best for")}</dt><dd>{copy(lang, skill.fitZh, skill.fitEn)}</dd></dl>
          <footer><span className={skill.status === "enabled" ? "ready" : "planned"}>{skill.status === "enabled" ? copy(lang, "内置流程 · 已启用", "Built in · Enabled") : copy(lang, "专业能力 · 即将开放", "Specialist · Coming soon")}</span><button type="button" onClick={() => activateSkill(skill)}>{skill.status === "enabled" ? copy(lang, "进入工作流", "Open workflow") : copy(lang, "查看规划", "View plan")} →</button></footer>
        </article>)}</div>
        <section className="sasi-skills-runtime"><div><small>HOW SASI SKILLS WORK</small><h2>{copy(lang, "能力被调用，但创作主权仍属于你", "Capability is invoked; creative control stays yours")}</h2><p>{copy(lang, "SASI 根据任务推荐合适的方法，你也可以手动指定。每项能力都说明输入、输出、权限和完成标准。", "SASI recommends a method by task, while you can still choose manually. Every capability declares its inputs, outputs, permissions and completion standard.")}</p></div><ol><li><b>01</b><span>{copy(lang, "理解任务后推荐", "Recommended after understanding")}</span></li><li><b>02</b><span>{copy(lang, "执行前展示权限", "Permissions shown before action")}</span></li><li><b>03</b><span>{copy(lang, "高风险操作再确认", "High-impact actions reconfirmed")}</span></li><li><b>04</b><span>{copy(lang, "结果与证据可核验", "Results and evidence verifiable")}</span></li></ol></section>
      </>}

      {activeTab === "create" && <section className="sasi-skills-author"><div><small>AUTHOR & PUBLISH</small><h2>{copy(lang, "把你的专业方法，编制成可复用能力", "Turn your professional method into reusable capability")}</h2><p>{copy(lang, "未来创作者可以定义适用场景、输入材料、执行步骤、交付标准与权限边界。发布前必须通过来源核验、隔离运行、安全审阅和版本管理。", "Creators will define fit, inputs, execution steps, delivery standards and permission boundaries. Publication requires provenance checks, isolated execution, security review and version control.")}</p><button type="button" onClick={() => setNotice(copy(lang, "能力编制器尚未开放提交。来源核验、隔离运行和专业审阅完成后，才会启用真实发布。", "Capability submission is not open yet. Real publishing starts only after provenance, isolation and professional review are ready."))}>{copy(lang, "查看开放条件", "View launch requirements")}</button></div><ol>{[["01","来源与版权","证明方法、资料与素材可以合法使用"],["02","权限说明","列明将读取、生成和写入什么"],["03","隔离验证","在安全环境中测试失败与异常路径"],["04","专业审阅","核对质量标准、适用范围与风险"],["05","版本发布","记录更新、兼容性与撤回机制"]].map(([number, title, note]) => <li key={number}><b>{number}</b><div><strong>{copy(lang, title, title)}</strong><span>{copy(lang, note, note)}</span></div><em>{copy(lang, "尚未开放", "Not open")}</em></li>)}</ol></section>}
    </section>
  );
}

export default function SasiWorkspace({ accountEmail }: { accountEmail: string | null }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);
  const [view, setViewState] = useState<View>("home");
  const [creationKind, setCreationKind] = useState<"drama" | "code">("drama");
  function setView(next: View) {
    if (next === "director" || next === "drama" || next === "code") { setCreationKind(next === "code" ? "code" : "drama"); next = "home"; }
    setViewState(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    if (next !== "project") url.searchParams.delete("projectId");
    url.hash = next === "billing" ? "topup" : "";
    setAccountMenuOpen(false);
    url.searchParams.delete("room");
    if (url.href !== window.location.href) window.history.pushState({}, "", url);
  }
  const [mobileNav, setMobileNav] = useState(false);
  const [homeBrief, setHomeBrief] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [script, setScript] = useState("");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [maxFileBytes, setMaxFileBytes] = useState(50 * 1024 * 1024);
  useEffect(() => { const controller = new AbortController(); void fetch("/api/sasi/assets/limits", { signal: controller.signal, cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => { if (Number.isSafeInteger(data?.maxFileBytes) && data.maxFileBytes > 0) setMaxFileBytes(Math.min(data.maxFileBytes, SASI_MAX_UPLOAD_BYTES)); }).catch(() => {}); return () => controller.abort(); }, []);
  const [seconds, setSeconds] = useState(30);
  const [quality, setQuality] = useState<SasiQuality>("fast");
  const [budget, setBudget] = useState(30);
  const [episodes, setEpisodes] = useState("1");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("lingxi-site-theme");
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
    setThemeReady(true);
    const search = new URLSearchParams(window.location.search);
    const requestedView = search.get("view");
    const requestedRoom = search.get("room");
    const routeView: Record<string, View> = { home: "home", director: "home", drama: "home", build: "home", code: "home", connections: "connections", skills: "skills", capabilities: "connections", models: "connections", billing: "billing", works: "works", account: "account", project: "project" };
    if (requestedView === "build" || requestedView === "code") setCreationKind("code");
    if (requestedView && routeView[requestedView]) setViewState(routeView[requestedView]);
    if (requestedRoom === "overview" || requestedRoom === "continuity" || requestedRoom === "shots") setDramaTab(requestedRoom);
    const restoreView = () => {
      const query = new URLSearchParams(window.location.search);
      setViewState(routeView[query.get("view") || "home"] || "home");
    };
    window.addEventListener("popstate", restoreView);
    return () => window.removeEventListener("popstate", restoreView);
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
  const [showDramaCreate, setShowDramaCreate] = useState(false);
  const dark = theme === "dark";
  const productionRoute = routeForQuality(quality);
  const quote = useMemo(() => budgetAssessment(productionRoute, seconds, Math.round(budget * 100)), [productionRoute, seconds, budget]);
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
    const url=new URL(window.location.href);url.searchParams.set("projectId",projectId);window.history.replaceState({},"",url);
  }

  useEffect(()=>{
    if(view!=="project"||!accountEmail)return;
    const id=new URLSearchParams(window.location.search).get("projectId");
    if(!id||projectDetail?.project.id===id)return;
    let active=true;
    void fetch(`/api/sasi/projects/${encodeURIComponent(id)}`,{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();const data=await r.json();if(active)setProjectDetail(data);}).catch(()=>{if(active)setNotice(copy(lang,"项目暂时无法读取，请从作品库重试。","Project unavailable. Please retry from your library."));});
    return()=>{active=false;};
  },[view,accountEmail,projectDetail?.project.id,lang]);

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
      if (!ACCEPTED_EXTENSIONS.has(extension) || file.size > maxFileBytes) {
        rejected.push(file.name);
        continue;
      }
      accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`, name: file.name, size: file.size, kind: classifyFile(file.name), source: file });
    }
    setFiles((current) => [...current, ...accepted].slice(0, 20));
    if (rejected.length) setNotice(copy(lang, `未加入：${rejected.join("、")}。请检查格式或 ${formatBytes(maxFileBytes)} 限制。`, `Not added: ${rejected.join(", ")}. Check format or the ${formatBytes(maxFileBytes)} limit.`));
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

  async function prepare(kind: "code" | "drama", submittedBrief?: string) {
    const input = submittedBrief?.trim() ?? (kind === "code" ? brief.trim() : script.trim());
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
          secondsPerEpisode: kind === "drama" ? seconds : undefined,
          budgetFen: Math.round(budget * 100),
          quality,
          episodes: kind === "drama" ? Number(episodes) : undefined,
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
      const failedAssets: string[] = [];
      if (files.length) {

        for (const file of files) {
          const ticketResponse = await fetch("/api/sasi/assets/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: result.project.id, name: file.name, size: file.size, mime: file.source.type || "application/octet-stream", kind: file.kind }) });
          if (!ticketResponse.ok) { failedAssets.push(file.name); continue; }
          const ticket = await ticketResponse.json();
          try { await uploadSasiAsset(file.source, ticket, percent => setNotice(copy(lang, `正在上传 ${file.name} · ${percent}%`, `Uploading ${file.name} · ${percent}%`))); } catch { failedAssets.push(file.name); continue; }
          const inspectResponse = await fetch(`/api/sasi/assets/${ticket.assetId}/inspect`, { method: "POST" });
          if (!inspectResponse.ok) { failedAssets.push(file.name); continue; }
          const inspection = await inspectResponse.json();
          uploadedAssets += 1;
          if (inspection.status === "external_scan_required") reviewAssets += 1;
        }
      }
      if (kind === "drama") {
        const plan = result.recommendation;
        setNotice(copy(lang,
          `项目 ${result.project.id.slice(0, 8)} 已建立：${plan.episodes} 集 × 约 ${plan.secondsPerEpisode} 秒。${uploadedAssets ? `已接收 ${uploadedAssets} 项资产${reviewAssets ? `，其中 ${reviewAssets} 项等待深度安全审阅` : "并完成安全索引"}。` : ""}${result.generationBlocked ? "项目已保存；制作任务将在报价确认后执行。" : "制作图谱已保存；获得最终授权后才会预留余额。"}`,
          `Project ${result.project.id.slice(0, 8)} is live: ${plan.episodes} episode(s) × about ${plan.secondsPerEpisode}s. ${uploadedAssets ? `${uploadedAssets} asset(s) received${reviewAssets ? `; ${reviewAssets} await deep security review` : " and safely indexed"}. ` : ""}${result.generationBlocked ? "Project saved; production requires an approved task quote." : "The production graph is saved; balance is reserved only after final authorization."}`,
        ));
      } else {
        setNotice(copy(lang, `项目 ${result.project.id.slice(0, 8)} 与 ${result.project.nodeCount} 个构建节点已保存。连接仓库后，代码写入和部署仍会分别请求授权。`, `Project ${result.project.id.slice(0, 8)} and ${result.project.nodeCount} build nodes are saved. Repository writes and deployment still require separate authorization.`));
      }
      await openProject(result.project.id);
      setFiles(current => current.filter(file => failedAssets.includes(file.name)));
      setNotice(failedAssets.length ? copy(lang, `项目已保存，但这些附件未上传成功：${failedAssets.join("、")}。文件仍保留在当前页面。`, `Project saved. Upload failed: ${failedAssets.join(", ")}. Files are retained.`) : copy(lang, `项目已保存，已接收 ${uploadedAssets} 份附件${reviewAssets ? "，其中部分资料等待解析" : ""}。`, `Project saved with ${uploadedAssets} uploaded assets.`));
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
          <div><p className="font-display text-lg tracking-[.12em]">灵犀场 SASI</p><p className="text-[11px] uppercase tracking-[.18em] opacity-55">Create · Build · Deliver</p></div>
        </button>

        <details className="lx-nav-group" open><summary>SASI · 创作工作台</summary>
        <nav className="space-y-1">
          {studioNav.map((item) => (
            <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${view === item.id ? (dark ? "border-[#668cff]/25 bg-[#27365d] text-white shadow-[inset_2px_0_#72d7ff]" : "border-[#6958d8]/15 bg-[#e7e9ff] text-[#171717] shadow-[inset_2px_0_#6958d8]") : "border-transparent hover:bg-current/5"}`}>
              <span className="w-7 text-center font-mono text-xs">{item.glyph}</span><span><b className="block text-[17px] font-medium">{copy(lang, item.zh, item.en)}</b><small className="mt-1 block text-[11px] font-normal opacity-55">{item.en}</small></span>
            </button>
          ))}
        </nav>

        </details><details className="lx-nav-group"><summary>{copy(lang, "灵犀场 · 意识显化", "Lingxi Field")}</summary>
        <nav className="space-y-1">
          {fieldNav.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm opacity-75 transition hover:bg-current/5 hover:opacity-100"><span className="w-7 text-center">{item.glyph}</span><span><b className="block text-[15px] font-medium">{copy(lang, item.zh, item.en)}</b><small className="mt-1 block text-[11px] font-normal opacity-55">{item.en}</small></span></Link>)}
        </nav>

        </details>
        <details className="lx-nav-group"><summary>灵犀场 · 小工具</summary><Link className="block rounded-xl px-3 py-3 text-sm" href="/tools">图片、文件与日常工具 →</Link></details>
        <details className="lx-nav-group"><summary>灵犀场 · 书本 SASI</summary>{[["/ai-knowledge", "让书本活起来"], ["/ai-learning", "AI学习 SASI"], ["/ai-research", "AI科研 SASI"]].map(([href, title]) => <Link key={href} className="block rounded-xl px-3 py-3 text-sm" href={href}>{title} →</Link>)}</details>
        <div className="mt-auto space-y-3 border-t border-current/10 pt-4">
          <div className="flex gap-2"><button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{lang === "zh" ? "EN" : "中文"}</button><button onClick={() => setTheme(dark ? "light" : "dark")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{dark ? "☀ Light" : "☾ Dark"}</button></div>
          <Link href={accountEmail ? "/account" : "/account?next=%2Fsasi"} className="block rounded-xl border border-current/15 px-3 py-3"><p className="truncate text-sm">{accountEmail ?? copy(lang, "连接场域账户", "Connect account")}</p><p className="mt-1 text-[11px] leading-5 opacity-55">{accountEmail ? copy(lang, "设置 · 切换 · 退出", "Settings · Switch · Sign out") : copy(lang, "登录后同步项目、作品与人民币余额", "Sign in to sync projects, works and RMB balance")}</p></Link>
        </div>
      </aside>

      <main className="min-h-screen px-4 pb-16 pt-20 lg:ml-[260px] lg:px-5 lg:pt-3">
        <a href="/?view=billing#topup" className="sasi-recharge-ribbon"><span aria-hidden="true">✦</span><span className="sasi-recharge-window"><span>{copy(lang,"让下一个想法开始生长 · 充值创作余额 →","Make room for your next idea · Top up →")}</span></span></a>
        <header className="relative mx-auto flex max-w-[1600px] items-center gap-3 border-b border-current/10 pb-3"><label className="hidden min-w-0 flex-1 items-center rounded-full border border-current/15 px-5 py-2.5 md:flex"><span className="mr-3 opacity-45">⌕</span><input value={headerSearch} onChange={(event)=>setHeaderSearch(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"&&headerSearch.trim()){setHomeBrief(headerSearch.trim());setView("home");}}} placeholder={copy(lang,"搜索作品、功能、教程或输入你的想法…","Search works, features, guides or enter an idea…")} className="w-full bg-transparent text-sm outline-none"/></label><button onClick={()=>setView("home")} className="rounded-full border border-[#7994ff]/60 px-5 py-2 text-sm font-semibold">＋ {copy(lang,"创作","Create")}</button><button aria-label={copy(lang,"查看通知","View notifications")} aria-expanded={notificationsOpen} onClick={()=>setNotificationsOpen(value=>!value)} className="relative grid h-10 w-10 place-items-center rounded-full border border-current/10"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.7"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg><i className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff566d] ring-2 ring-[var(--sasi-notice-ring)]"/></button><button type="button" onClick={() => setView("billing")} className="sasi-header-topup">{copy(lang,"充值","Top up")}</button><div className="relative"><button type="button" aria-label={copy(lang,"账户菜单","Account menu")} aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen(open => !open)} className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#68d8ff] to-[#7657ff] text-white">◎</button>{accountMenuOpen && <div className={`sasi-account-menu rounded-2xl border p-3 shadow-xl ${panel}`} onKeyDown={event => { if (event.key === "Escape") setAccountMenuOpen(false); }}><p>{accountEmail ?? copy(lang,"尚未登录","Not signed in")}</p><button type="button" onClick={() => setView("billing")}>{copy(lang,"充值创作余额","Top up creative balance")} ↗</button><button type="button" onClick={() => setView("account")}>{copy(lang,"我的账户","My account")}</button><button type="button" onClick={() => setAccountMenuOpen(false)}>{copy(lang,"关闭","Close")}</button></div>}</div>{notificationsOpen&&<aside className={`absolute right-12 top-12 z-30 w-[min(380px,calc(100vw-32px))] rounded-2xl border p-4 shadow-2xl ${panel}`}><div className="flex items-center justify-between"><h2 className="font-semibold">{copy(lang,"公告与更新","News & updates")}</h2><button aria-label={copy(lang,"关闭通知","Close notifications")} onClick={()=>setNotificationsOpen(false)} className="grid h-7 w-7 place-items-center rounded-full border border-current/10 opacity-55">×</button></div><div className="mt-3 space-y-2">{SASI_UPDATES.map(item=><a href={item.href} key={item.id} className="block rounded-xl border border-current/10 p-3"><p className="text-sm font-medium">{copy(lang,item.zh,item.en)}</p><p className="mt-1 text-xs opacity-60">{copy(lang,item.detailZh,item.detailEn)}</p><time className="mt-2 block text-xs text-[#6b75ff]">{item.date}</time></a>)}</div></aside>}</header>

        <div className="mx-auto mt-3 max-w-[1600px]">
          {view === "home" && <SasiComposer kind={creationKind} setKind={setCreationKind} lang={lang} value={homeBrief} onChange={setHomeBrief} onPaste={handlePaste} busy={preparing} signedIn={Boolean(accountEmail)} onSubmit={kind => void prepare(kind, homeBrief)} onConnections={() => setView("connections")} onSkills={() => setView("skills")} projects={projects} onOpen={id => void openProject(id)} attachments={<UploadHub maxFileBytes={maxFileBytes} lang={lang} files={files} onAdd={addFiles} onRemove={id => setFiles(current => current.filter(file => file.id !== id))} onNotice={setNotice} onOpenConnections={() => setView("connections")} />} />}

          {view === "project" && projectDetail && (
            <section><button type="button" onClick={() => setView("home")} className="text-sm opacity-55 hover:opacity-100">← {copy(lang, "返回项目列表", "Back to projects")}</button><div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-[#7657ff]">{projectDetail.project.kind === "drama" ? "SASI STORY GRAPH" : "SASI BUILD GRAPH"}</p><h1 className="mt-3 max-w-4xl text-4xl font-semibold">{projectDetail.project.title}</h1><p className="mt-3 font-mono text-xs opacity-35">{projectDetail.project.id}</p></div><span className="rounded-full border border-current/15 px-4 py-2 text-xs">{copy(lang, `版本 ${projectDetail.project.currentVersion}`, `Version ${projectDetail.project.currentVersion}`)}</span></div><div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]"><div><h2 className="text-lg font-semibold">{copy(lang, "生产节点", "Production nodes")} <span className="ml-2 text-xs font-normal opacity-40">{projectDetail.dependencies.length} {copy(lang, "条依赖", "edges")}</span></h2><div className="mt-4 space-y-3">{projectDetail.nodes.map((node, index) => <article key={node.id} className={`flex items-center gap-4 rounded-2xl border p-4 ${panel}`}><span className="font-mono text-xs opacity-30">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{node.type.replaceAll("-", " ")}</p><p className="mt-1 text-[10px] uppercase tracking-[.15em] opacity-40">v{node.version}</p></div><span className={`rounded-full px-3 py-1 text-[10px] ${node.status === "ready" ? "bg-emerald-500/10 text-emerald-600" : "bg-current/5 opacity-55"}`}>{node.status}</span></article>)}</div></div><aside><h2 className="text-lg font-semibold">{copy(lang, "项目资产", "Project assets")}</h2><div className="mt-4 space-y-3">{projectDetail.assets.length === 0 ? <div className={`rounded-2xl border p-5 text-sm leading-6 opacity-50 ${panel}`}>{copy(lang, "尚无云端资产。下一次建立项目时添加文件，SASI 会将其写入隔离区并完成安全分流。", "No cloud assets yet. Add files when creating the next project; SASI will place them in quarantine and route them through inspection.")}</div> : projectDetail.assets.map((asset) => <article key={asset.id} className={`rounded-2xl border p-4 ${panel}`}><p className="truncate text-sm font-medium">{asset.name}</p><div className="mt-3 flex items-center justify-between text-[10px]"><span className="opacity-40">{formatBytes(asset.verifiedSize ?? asset.declaredSize)}</span><span className="uppercase tracking-[.12em] opacity-55">{asset.status.replaceAll("_", " ")}</span></div></article>)}</div></aside></div></section>
          )}

          {view === "project" && projectDetail && <section><h1 className="my-6 text-2xl">{projectDetail.project.title}</h1><SasiProjectMemory key={projectDetail.project.id} projectId={projectDetail.project.id} lang={lang}/><SasiProjectProduction detail={projectDetail} lang={lang} dark={dark} onReload={() => openProject(projectDetail.project.id)} onNotice={setNotice} /></section>}
          {view === "project" && !projectDetail && <p className="p-6"><Link href="/?view=works">{copy(lang,"打开作品库，继续你的项目 →","Open your library to continue →")}</Link></p>}

          {view === "director" && <CangXuanDirectorStudio lang={lang} dark={dark} accountEmail={accountEmail} onEnterProduction={(story) => { setScript(story); setView("drama"); }} />}

          {view === "code" && (
            <BuildDeployConsole maxFileBytes={maxFileBytes} lang={lang} dark={dark} accountEmail={accountEmail} brief={brief} setBrief={setBrief} files={files} addFiles={addFiles} removeFile={(id) => setFiles((current) => current.filter((file) => file.id !== id))} handlePaste={handlePaste} preparing={preparing} prepareProject={() => prepare("code")} projects={projects} openProject={openProject} openConnections={() => setView("connections")} setNotice={setNotice} />
          )}

          {view === "drama" && (
            <section>
              <div className="sasi-drama-hero">
                <p className="sasi-drama-kicker">LINGXI FIELD · SASI DRAMA STUDIO</p>
                <h1>{copy(lang,"AI 短剧工坊","AI Drama Studio")}</h1>
                <h2>{copy(lang,"从剧本到完整成片，让每一集都认得同一个人。","From script to finished episodes—with one continuous cast.")}</h2>
                <p>{copy(lang,"不只生成一个漂亮镜头。SASI 先锁定人物、剧情、场景与声音，再把小说、剧本或一个想法推进为可逐步修改的制作流程。","Go beyond one beautiful shot. Lock character, story, setting and sound first, then move a novel, script or idea through an editable production workflow.")}</p>
                <div><span>◎ {copy(lang,"角色一致","Consistent cast")}</span><span>▤ {copy(lang,"分集规划","Episode planning")}</span><span>▣ {copy(lang,"逐镜生产","Shot production")}</span><span>◇ {copy(lang,"成本先看清","Cost before action")}</span></div>
              </div>
              <nav className="drama-main-tabs" aria-label={copy(lang,"AI 短剧工坊工作台","AI Drama Studio workspaces")}>{[["overview","项目总览","Project Overview"],["continuity","人物与连续性","Character & Continuity"],["shots","故事板与镜头生产","Storyboard & Shot Production"]].map(([id,zh,en])=><button key={id} onClick={()=>{setDramaTab(id as typeof dramaTab);window.history.replaceState({},"",`/?view=drama&room=${id}`)}} className={dramaTab===id?"is-active":""}><b>{copy(lang,zh,en)}</b><small>AI {copy(lang,"短剧工坊","Drama Studio")}</small></button>)}</nav>
              {dramaTab === "overview" && <>
              <DramaOverviewConsole lang={lang} onStart={()=>setShowDramaCreate(true)}/>
              {showDramaCreate && <>
              <div className="mt-6 flex flex-wrap gap-2">{[["我只有一个想法", "I have an idea"], ["我有完整剧本", "I have a script"], ["我有小说 / 故事", "I have a novel"], ["我已经有角色", "I have characters"], ["我已有故事板", "I have storyboards"], ["只生成一个镜头", "Generate one shot"]].map(([zh, en]) => <button key={zh} type="button" onClick={() => setScript(copy(lang, zh, en))} className="rounded-full border border-current/15 px-4 py-2 text-xs hover:border-[#e04d70]">{copy(lang, zh, en)}</button>)}</div>
              <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className={`rounded-3xl border p-6 ${panel}`}><textarea value={script} onChange={(event) => setScript(event.target.value)} onPaste={handlePaste} placeholder={copy(lang, "写下创意，或导入剧本、小说、人物图、故事板、音频和已有视频……", "Write an idea or import a script, novel, character image, storyboard, audio or existing video…")} className="min-h-36 w-full resize-none bg-transparent text-base leading-7 outline-none"/><UploadHub maxFileBytes={maxFileBytes} lang={lang} files={files} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onNotice={setNotice} /><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs opacity-60">{copy(lang, "每集时长（5–600秒）", "Seconds per episode (5–600)")}<input type="number" min={5} max={600} value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "制作集数", "Number of episodes")}<input type="number" min={1} max={200} value={episodes} onChange={(event) => setEpisodes(event.target.value)} placeholder={copy(lang, "填写本次制作集数", "Episodes for this project")} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "项目预算上限（人民币）", "Project budget cap (RMB)")}<input type="number" min={0} step="1" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "制作规格", "Production grade")}<select value={quality} onChange={(event) => setQuality(event.target.value as SasiQuality)} className={`mt-2 w-full rounded-xl border border-current/15 px-3 py-3 text-base outline-none ${dark ? "bg-[#11151b]" : "bg-white"}`}>{SASI_QUALITY_TIERS.map((item) => <option key={item.id} value={item.id}>{copy(lang, item.zh, item.en)}</option>)}</select></label></div><p className="mt-4 text-xs leading-5 opacity-50">{copy(lang, "SASI Auto 将按叙事价值调度制作能力；无需选择模型或管理技术账户。", "SASI Auto allocates production capability by narrative value; no model or technical account selection is required.")}</p><button disabled={preparing} onClick={() => prepare("drama")} className="mt-6 w-full rounded-xl bg-[#e04d70] py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50">{preparing ? copy(lang, "正在建立项目…", "Creating project…") : copy(lang, "建立项目并形成提案", "Create project & proposal")}</button></div>
                <div className={`rounded-3xl border border-current/10 p-6 ${panel}`}><p className="text-xs uppercase tracking-[.2em] opacity-55">TASK BUDGET</p><h3 className="mt-5 text-2xl font-semibold">{copy(lang,"先把作品说清，再确认价格","Define the work before approving a price")}</h3><p className="mt-4 text-sm leading-7 opacity-65">{copy(lang,"你填写的是预算意向。项目建立后，SASI 按实际可用的模型与规格提供本次任务报价；确认前不预留余额。","This is your intended budget. After creating a project, SASI quotes available models and specifications before reserving any balance.")}</p><p className="mt-5">{copy(lang,"预算意向","Intended budget")} <b>{formatRmb(quote.budget)}</b></p><p className="mt-3 text-xs opacity-55">{Number(episodes) || 1} × {seconds}s = {(Number(episodes) || 1) * seconds}s · {copy(lang,"报价待确认 · 不代表已经生成","Quote pending · not generated")}</p></div>
              </div>
              <div className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{copy(lang, "可逐幕审阅的制作链", "A production chain reviewed scene by scene")}</h2><span className="text-xs opacity-45">{copy(lang, "每一步都保留创作主权", "Creative control at every stage")}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(lang === "zh" ? workflowZh : workflowEn).map((item, index) => <div key={item} className="rounded-2xl border border-current/10 p-4"><p className="text-xs opacity-35">{String(index + 1).padStart(2, "0")}</p><p className="mt-3 text-sm font-medium">{item}</p><p className="mt-2 text-[11px] opacity-45">{index < 3 ? copy(lang, "分析后可修改", "Editable after analysis") : copy(lang, "生成、编辑或重做", "Generate, edit or redo")}</p></div>)}</div></div>
              <div className="mt-7 rounded-3xl border border-current/10 p-6"><p className="text-xs uppercase tracking-[.2em] text-[#e04d70]">{copy(lang, "典藏级关键镜头", "Signature key shots")}</p><p className="mt-3 leading-7 opacity-65">{copy(lang, "SASI 会把最高制作规格集中于人物登场、高潮、战斗与情绪特写，并为承接叙事的镜头匹配恰当方案；每次调整都会先呈现作品表现与人民币预算的变化。", "SASI concentrates the highest production grade on entrances, climaxes, action and emotional close-ups, then assigns the right approach to supporting shots. Every revision reveals its impact on creative finish and RMB budget first.")}</p></div>
              </>}
              </>}
              {dramaTab === "continuity" && <DramaVisualWorkspace lang={lang} dark={dark} mode="continuity" />}
              {dramaTab === "shots" && <DramaVisualWorkspace lang={lang} dark={dark} mode="shots" />}
            </section>
          )}

          {view === "skills" && (
            <SkillsMarketplace lang={lang} dark={dark} activeTab={skillTab} setActiveTab={setSkillTab} openView={setView} setNotice={setNotice} />
          )}

          {view === "connections" && <ConnectionCenter lang={lang} dark={dark} accountEmail={accountEmail} />}

          {view === "billing" && <SasiProductionAccount lang={lang} dark={dark} accountEmail={accountEmail} onNotice={setNotice} />}

          {view === "works" && <SasiWorkLibrary lang={lang} dark={dark} projects={projects} loaded={projectsLoaded} onOpen={openProject} onRefresh={refreshProjects} onCreate={(target,preset)=>{ if(preset){ setHomeBrief(preset); if(target==="drama") setScript(preset); if(target==="code") setBrief(preset); if(target==="director") window.localStorage.setItem("cangxuan-director-draft-v1",JSON.stringify({title:"",premise:preset,protagonist:"",mode:"motion-comic",genre:"古装复仇",episodes:24,secondsPerEpisode:60})); } setView(target); }} />}

          {view === "account" && <SasiAccountCenter lang={lang} dark={dark} accountEmail={accountEmail} projectCount={projects.length} onOpenWorks={()=>setView("works")} onOpenModels={()=>setView("connections")} />}

          {view !== "home" && <footer className="mt-16 border-t border-current/10 py-8"><p className="text-xs uppercase tracking-[.2em] opacity-40">{copy(lang, "法律与规则", "Legal & Rules")}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{(lang === "zh" ? legalZh : legalEn).map((label) => <Link key={label} href="/legal/sasi" className="text-xs opacity-55 hover:opacity-100">{label}</Link>)}</div><p className="mt-6 max-w-4xl text-xs leading-6 opacity-40">{copy(lang, "SASI 工作台已经开放。连接自己的模型 API 后，可以继续推理、编剧、规划与生产；使用灵犀场托管能力时，系统会在执行前显示真实状态、费用与结算方式。", "The SASI workspace is open. Connect your own model APIs for reasoning, writing, planning and production; hosted LINGXIFIELD capabilities show live status, cost and settlement before execution.")}</p></footer>}
        </div>
      </main>

      {notice && <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border p-4 text-sm shadow-2xl ${dark ? "border-white/15 bg-[#151922]" : "border-black/10 bg-white"}`}><button onClick={() => setNotice("")} className="float-right ml-4 opacity-45">×</button>{notice}</div>}
    </div>
  );
}
