"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { budgetAssessment, CREDIT_PACKS, POINTS_PER_RMB, providerForQuality, SASI_PROVIDERS, SASI_QUALITY_TIERS, SASI_SKILLS, type SasiMode, type SasiQuality } from "@/lib/sasi/catalog";

type Lang = "zh" | "en";
type Theme = "light" | "dark";

const studioNav: { id: SasiMode; zh: string; en: string; glyph: string }[] = [
  { id: "code", zh: "编程构建部署", en: "Build & Deploy", glyph: "</>" },
  { id: "drama", zh: "AI 短剧工坊", en: "AI Drama Studio", glyph: "▶" },
  { id: "skills", zh: "Skill 中心", en: "Skill Center", glyph: "✦" },
  { id: "billing", zh: "积分与充值", en: "Credits & Billing", glyph: "◈" },
];

const fieldNav = [
  { href: "/live-as", zh: "意识显化", en: "Manifestation", glyph: "◉" },
  { href: "/#field-insights", zh: "场域精测", en: "Field Insights", glyph: "⌁" },
  { href: "/#gates", zh: "重塑潜意识", en: "Subconscious Rewrite", glyph: "◎" },
  { href: "/practice", zh: "修炼技术 · FREE", en: "Practices · FREE", glyph: "♢" },
  { href: "/account", zh: "我的场域", en: "My Field", glyph: "○" },
];

function copy(lang: Lang, zh: string, en: string) { return lang === "zh" ? zh : en; }

export default function SasiWorkspace({ accountEmail }: { accountEmail: string | null }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState<Theme>("light");
  const [mode, setMode] = useState<SasiMode>("code");
  const [mobileNav, setMobileNav] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [quality, setQuality] = useState<SasiQuality>("fast");
  const [advanced, setAdvanced] = useState(false);
  const [videoProvider, setVideoProvider] = useState("veo-lite");
  const [budget, setBudget] = useState(30);
  const [episodes, setEpisodes] = useState("");
  const [script, setScript] = useState("");
  const [brief, setBrief] = useState("");
  const [notice, setNotice] = useState("");
  const effectiveProvider = advanced ? videoProvider : providerForQuality(quality);
  const quote = useMemo(() => budgetAssessment(effectiveProvider, seconds, budget), [effectiveProvider, seconds, budget]);
  const dark = theme === "dark";
  const videoProviders = SASI_PROVIDERS.filter((item) => item.kind === "video");
  const codeProviders = SASI_PROVIDERS.filter((item) => item.kind === "code");

  async function prepare(kind: "code" | "drama") {
    const hasInput = kind === "code" ? brief.trim().length >= 12 : script.trim().length >= 20;
    if (!hasInput) {
      setNotice(copy(lang, "请先写下更完整的需求。", "Add a more complete brief first."));
      return;
    }
    try {
      const response = await fetch("/api/sasi/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, brief: kind === "code" ? brief : script, seconds, budget, quality, episodes: episodes ? Number(episodes) : undefined }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "PREPARE_FAILED");
      if (kind === "drama") {
        const plan = result.recommendation;
        setNotice(copy(lang,
          `建议方案：${plan.episodes} 集 × 约 ${plan.secondsPerEpisode} 秒。${result.generationBlocked ? `当前预算还差 ¥${result.quote.gap.toFixed(2)}，不会启动收费生成。` : "预算覆盖当前质量档；仍需在最终确认卡再次确认才会冻结余额。"}`,
          `Suggested plan: ${plan.episodes} episode(s) × about ${plan.secondsPerEpisode}s. ${result.generationBlocked ? `Budget gap: ¥${result.quote.gap.toFixed(2)}. Paid generation stays blocked.` : "The budget covers this tier; funds are reserved only after a final confirmation card."}`
        ));
      } else {
        setNotice(copy(lang, "构建任务已完成预检；连接仓库后仍会在外部写入和部署前分别确认。", "Build task prepared. Repository writes and deployment will each require confirmation after connection."));
      }
    } catch {
      setNotice(copy(lang, "任务预检失败，请稍后重试。", "Task preparation failed. Please try again."));
    }
  }

  return (
    <div className={dark ? "min-h-screen bg-[#090b0f] text-[#f3f3ef]" : "min-h-screen bg-[#f7f7f3] text-[#171717]"}>
      <button onClick={() => setMobileNav((value) => !value)} className="fixed left-4 top-4 z-50 rounded-xl border border-current/15 bg-inherit px-3 py-2 text-sm lg:hidden">☰ SASI</button>
      <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r p-5 transition lg:translate-x-0 ${dark ? "border-white/10 bg-[#0d1015]" : "border-black/10 bg-white"}`}>
        <Link href="/sasi" className="mb-7 flex items-center gap-3" onClick={() => setMobileNav(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="h-10 w-10 rounded-xl" />
          <div><p className="font-display text-lg tracking-[.12em]">灵犀场 SASI</p><p className="text-[10px] uppercase tracking-[.2em] opacity-50">Build · Story · Intelligence</p></div>
        </Link>

        <p className="mb-2 text-[10px] uppercase tracking-[.22em] opacity-45">SASI Studio</p>
        <nav className="space-y-1">
          {studioNav.map((item) => <button key={item.id} onClick={() => { setMode(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${mode === item.id ? (dark ? "bg-white text-black" : "bg-black text-white") : "hover:bg-current/5"}`}><span className="w-7 text-center font-mono text-xs">{item.glyph}</span>{copy(lang, item.zh, item.en)}</button>)}
        </nav>

        <p className="mb-2 mt-7 text-[10px] uppercase tracking-[.22em] opacity-45">Lingxi Field</p>
        <nav className="space-y-1">
          {fieldNav.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm opacity-70 transition hover:bg-current/5 hover:opacity-100"><span className="w-7 text-center">{item.glyph}</span>{copy(lang, item.zh, item.en)}</Link>)}
        </nav>

        <div className="mt-auto space-y-3 border-t border-current/10 pt-4">
          <div className="flex gap-2"><button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{lang === "zh" ? "EN" : "中文"}</button><button onClick={() => setTheme(dark ? "light" : "dark")} className="flex-1 rounded-lg border border-current/15 px-3 py-2 text-xs">{dark ? "☀ Light" : "☾ Dark"}</button></div>
          <Link href="/account" className="block rounded-xl border border-current/15 px-3 py-3"><p className="truncate text-sm">{accountEmail ?? copy(lang, "连接场域账户", "Connect account")}</p><p className="mt-1 text-[10px] opacity-50">{accountEmail ? copy(lang, "设置 · 切换 · 退出", "Settings · Switch · Sign out") : copy(lang, "登录后同步项目与积分", "Sign in to sync projects and credits")}</p></Link>
        </div>
      </aside>

      <main className="min-h-screen px-5 pb-16 pt-20 lg:ml-[286px] lg:px-10 lg:pt-8">
        <header className="mx-auto flex max-w-[1280px] items-center justify-between border-b border-current/10 pb-5"><div><p className="text-xs uppercase tracking-[.22em] opacity-45">Lingxifield Sovereign AI Studio</p><h1 className="mt-2 text-2xl font-semibold">{copy(lang, "把一个想法，推进到可以交付", "Move an idea all the way to delivery")}</h1></div><button onClick={() => setMode("billing")} className={`rounded-xl px-4 py-2 text-sm ${dark ? "bg-[#d9ff73] text-black" : "bg-black text-white"}`}>{copy(lang, "充值积分", "Add credits")}</button></header>

        <div className="mx-auto mt-8 max-w-[1280px]">
          {mode === "code" && <section>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">01 · Build</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{copy(lang, "编程、构建、验证、部署", "Code, build, verify and deploy")}</h2><p className="mt-4 max-w-3xl text-base leading-8 opacity-60">{copy(lang, "从产品需求进入真实仓库工作流。代理必须交付可审阅代码、测试证据与明确部署状态，而不只是一段聊天答案。", "Turn a product brief into a repository workflow with reviewable code, test evidence and explicit deployment state—not merely a chat answer.")}</p>
            <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className={`rounded-3xl border p-6 ${dark ? "border-white/10 bg-white/[.03]" : "border-black/10 bg-white"}`}><textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder={copy(lang, "描述要构建的网站、功能、现有仓库和部署目标……", "Describe the website, feature, repository and deployment target…")} className="min-h-48 w-full resize-none bg-transparent text-base leading-7 outline-none"/><div className="mt-5 flex flex-wrap gap-2">{codeProviders.map((item) => <span key={item.id} className="rounded-full border border-current/15 px-3 py-1.5 text-xs">{item.name}</span>)}</div><button onClick={() => prepare("code")} className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold ${dark ? "bg-white text-black" : "bg-black text-white"}`}>{copy(lang, "建立构建任务", "Prepare build task")}</button></div>
              <div className="space-y-3">{SASI_SKILLS.filter((skill) => (skill.modes as readonly string[]).includes("code")).map((skill) => <div key={skill.id} className="rounded-2xl border border-current/10 p-4"><p className="font-medium"><span className="mr-2 text-[#7657ff]">{skill.glyph}</span>{copy(lang, skill.zh, skill.en)}</p><p className="mt-2 text-xs leading-5 opacity-55">{copy(lang, skill.noteZh, skill.noteEn)}</p></div>)}</div>
            </div>
          </section>}

          {mode === "drama" && <section>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#e04d70]">02 · Story</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{copy(lang, "从任意故事规模，到可修改的成片工作流", "From any story scale to an editable production workflow")}</h2><p className="mt-4 max-w-3xl text-base leading-8 opacity-60">{copy(lang, "SASI 先读内容，再建议它适合一条短片、若干集或长期 IP；绝不默认 100 集。爆款分析只学习钩子、冲突、回报和悬念结构，不复制现有 IP。长片由 5–15 秒镜头分片组成。", "SASI reads the material first, then recommends a clip, series or long-form IP—never a default 100 episodes. Hit analysis learns abstract hooks, conflict, payoff and cliffhangers without copying existing IP. Long-form work is composed from 5–15 second shots.")}</p>
            <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_360px]">
              <div className={`rounded-3xl border p-6 ${dark ? "border-white/10 bg-white/[.03]" : "border-black/10 bg-white"}`}><textarea value={script} onChange={(event) => setScript(event.target.value)} placeholder={copy(lang, "粘贴原创剧本、小说、故事梗概或一句话创意；SASI 会先提出建议，不会直接烧费……", "Paste an original script, novel, synopsis or one-line idea. SASI recommends a plan before any paid generation…")} className="min-h-44 w-full resize-none bg-transparent text-base leading-7 outline-none"/><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs opacity-60">{copy(lang, "目标总时长（5–600秒）", "Total duration (5–600 sec)")}<input type="number" min={5} max={600} value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "集数（可留空，由 SASI 建议）", "Episodes (optional; let SASI recommend)")}<input type="number" min={1} max={200} value={episodes} onChange={(event) => setEpisodes(event.target.value)} placeholder={copy(lang, "不预设", "Not preset")} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "我的预算（人民币）", "My budget (RMB)")}<input type="number" min={0} step="1" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-current/15 bg-transparent px-3 py-3 text-base outline-none"/></label><label className="text-xs opacity-60">{copy(lang, "质量目标", "Quality target")}<select value={quality} onChange={(event) => setQuality(event.target.value as SasiQuality)} className={`mt-2 w-full rounded-xl border border-current/15 px-3 py-3 text-base outline-none ${dark ? "bg-[#11151b]" : "bg-white"}`}>{SASI_QUALITY_TIERS.map((item) => <option key={item.id} value={item.id}>{copy(lang, item.zh, item.en)}</option>)}</select></label></div><button onClick={() => setAdvanced((value) => !value)} className="mt-4 text-xs underline underline-offset-4 opacity-60">{advanced ? copy(lang, "收起专业设置", "Hide Professional Mode") : copy(lang, "专业模式：选择具体 Provider", "Professional Mode: choose provider")}</button>{advanced && <label className="mt-3 block text-xs opacity-60">Provider<select value={videoProvider} onChange={(event) => setVideoProvider(event.target.value)} className={`mt-2 w-full rounded-xl border border-current/15 px-3 py-3 text-base outline-none ${dark ? "bg-[#11151b]" : "bg-white"}`}>{videoProviders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<button onClick={() => prepare("drama")} className="mt-6 w-full rounded-xl bg-[#e04d70] py-3 text-sm font-semibold text-white">{copy(lang, "分析内容并提出生产方案", "Analyze and recommend a production plan")}</button></div>
              <div className={`rounded-3xl p-6 ${dark ? "bg-[#d9ff73] text-black" : "bg-[#151515] text-white"}`}><p className="text-xs uppercase tracking-[.2em] opacity-55">Budget × Quality</p><p className="mt-5 text-3xl font-semibold">¥{quote.price.toFixed(2)}</p><p className="mt-1 text-sm opacity-60">{quote.points.toLocaleString()} points · {quote.duration}s</p><div className="my-5 border-t border-current/15"/><p className="text-sm">{advanced ? quote.provider?.name : copy(lang, "SASI Auto · 模型由预算与质量路由", "SASI Auto · routed by budget and quality")}</p><dl className="mt-5 space-y-2 text-xs"><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "模型基础成本", "Model base cost")}</dt><dd>¥{quote.cost.toFixed(2)}</dd></div><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "我的预算", "My budget")}</dt><dd>¥{quote.budget.toFixed(2)}</dd></div><div className="flex justify-between"><dt className="opacity-55">{copy(lang, "预算差额", "Budget gap")}</dt><dd>¥{quote.gap.toFixed(2)}</dd></div></dl><div className={`mt-5 rounded-xl p-3 text-xs leading-5 ${quote.canConfirm ? "bg-emerald-500/15" : "bg-amber-500/20"}`}>{quote.canConfirm ? copy(lang, "预算覆盖当前档位。分析后仍需确认最终费用，才会冻结余额。", "Budget covers this tier. Final cost still requires confirmation before reservation.") : copy(lang, "预算不足：不会静默降质或启动付费生成。可增加预算、缩短时长、调整档位或使用 BYOK。", "Insufficient budget: no silent downgrade or paid generation. Increase budget, shorten duration, change tier or use BYOK.")}</div></div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{["剧本解析", "人物身份板", "故事板", "配音声音", "视频合成"].map((item, index) => <div key={item} className="rounded-2xl border border-current/10 p-4"><p className="text-xs opacity-40">0{index + 1}</p><p className="mt-3 text-sm font-medium">{lang === "zh" ? item : ["Script analysis", "Character bible", "Storyboard", "Voice & sound", "Video assembly"][index]}</p></div>)}</div>
          </section>}

          {mode === "skills" && <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">Skills</p><h2 className="mt-3 text-4xl font-semibold">{copy(lang, "先有可靠工作流，再开放用户 Skill", "Reliable workflows before user-uploaded Skills")}</h2><p className="mt-4 max-w-3xl leading-8 opacity-60">{copy(lang, "首批 Skill 由平台维护并版本化。用户上传、权限声明和安全审查会在任务沙箱完成后开放。", "The first Skills are maintained and versioned by the platform. User uploads, permissions and safety review open only after the job sandbox is ready.")}</p><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SASI_SKILLS.map((skill) => <article key={skill.id} className={`rounded-3xl border p-6 ${dark ? "border-white/10 bg-white/[.03]" : "border-black/10 bg-white"}`}><span className="text-2xl text-[#7657ff]">{skill.glyph}</span><h3 className="mt-5 text-lg font-semibold">{copy(lang, skill.zh, skill.en)}</h3><p className="mt-3 text-sm leading-6 opacity-55">{copy(lang, skill.noteZh, skill.noteEn)}</p><p className="mt-5 text-[10px] uppercase tracking-[.18em] opacity-40">Official · v1</p></article>)}</div></section>}

          {mode === "billing" && <section><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7657ff]">Credits</p><h2 className="mt-3 text-4xl font-semibold">{copy(lang, "先充值，后调用；平台不垫资", "Prepay first; the platform never fronts model spend")}</h2><p className="mt-4 max-w-3xl leading-8 opacity-60">{copy(lang, `统一换算：${POINTS_PER_RMB} 积分 = ¥1。积分只用于 SASI 的模型与工作流调用；意识显化仍是独立订阅。`, `${POINTS_PER_RMB} points = ¥1. Credits are only for SASI model and workflow usage; Manifestation remains a separate subscription.`)}</p><div className="mt-8 grid gap-4 md:grid-cols-3">{CREDIT_PACKS.map((pack) => <article key={pack.id} className={`rounded-3xl border p-7 ${dark ? "border-white/10 bg-white/[.03]" : "border-black/10 bg-white"}`}><p className="text-3xl font-semibold">¥{pack.rmb}</p><p className="mt-2 text-sm opacity-55">{pack.points.toLocaleString()} points</p><button onClick={() => setNotice(copy(lang, "积分账本迁移和支付回调未启用前不会收款。", "No payment is taken until the credit ledger migration and payment callbacks are enabled."))} className="mt-7 w-full rounded-xl border border-current/20 py-3 text-sm">{copy(lang, "准备充值", "Prepare top-up")}</button></article>)}</div><div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-7">{copy(lang, "零预算启动原则：用户资金到账后才创建供应商任务；每单预留失败重试、汇率、支付手续费和退款准备金。绝不赠送需要平台垫付的生成额度。", "Zero-budget rule: provider jobs are created only after user funds settle. Every order reserves for retries, FX, payment fees and refunds. Never give away generation credits that require platform-funded compute.")}</div></section>}

          {notice && <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border p-4 text-sm shadow-2xl ${dark ? "border-white/15 bg-[#151922]" : "border-black/10 bg-white"}`}><button onClick={() => setNotice("")} className="float-right ml-4 opacity-45">×</button>{notice}</div>}
        </div>
      </main>
    </div>
  );
}
