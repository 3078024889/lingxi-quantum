"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NARRATIVES } from "@/lib/narratives";
import Bi from "@/components/Bi";

/* 场域搜索 · 导航搜索框
 * 特点：
 * - 输入即时匹配多维叙事（标题/简介，中英双语）
 * - 也收录站内几个核心页面，方便直接跳转
 * - 点击/聚焦框体时，绽放一圈局部水波纹（与全站的 ClickRipple 是两回事，
 *   这个水波纹只在框内出现，强调"这是一个可以被触碰的场域入口"）
 */

type StaticEntry = { slug: string; title: string; titleEn: string; href: string };
const STATIC_PAGES: StaticEntry[] = [
  { slug: "live-as", title: "意识显化", titleEn: "Manifestation", href: "/live-as" },
  { slug: "dream", title: "探索梦境", titleEn: "Dreams", href: "/dream" },
  { slug: "practice", title: "修炼技术", titleEn: "Practices", href: "/practice" },
  { slug: "gates", title: "重塑潜意识", titleEn: "Rewrite", href: "/#gates" },
  { slug: "narrative", title: "多维叙事", titleEn: "Narratives", href: "/narrative" },
  { slug: "learn", title: "探索", titleEn: "Learn", href: "/learn" },
  { slug: "membership", title: "能量交换场", titleEn: "Access", href: "/membership" },
  { slug: "number-energy", title: "手机号车牌号测试", titleEn: "Number Energy", href: "/tools/number-energy" },
  { slug: "life-map", title: "生命图谱", titleEn: "Life Map", href: "/life-map" },
  // 之前这里只收录了大类目（"修炼技术"这种），四项具体的修炼技术各自
  // 叫什么名字，完全没被收进来——搜具体的"量子息法"，只能匹配到大类
  // 目名称里完全不沾边的字，自然搜不到，会掉进"没有结果"或者误撞进
  // 多维叙事里某篇不相关内容的标题/简介。这里把四个具体名字都补上。
  { slug: "practice-breath", title: "量子息法", titleEn: "Quantum Breath Method", href: "/practice/breath" },
  { slug: "practice-intuition", title: "直觉丹道", titleEn: "The Intuitive Way", href: "/practice/intuition" },
  { slug: "practice-heart-reset", title: "归零心诀", titleEn: "Heart Reset", href: "/practice/heart-reset" },
  { slug: "practice-ascending-heart", title: "上升心经", titleEn: "Ascending Heart Sutra", href: "/practice/ascending-heart" },
  { slug: "account", title: "场域入口", titleEn: "Field Entrance", href: "/account" },
  { slug: "relationship", title: "关系共振图谱", titleEn: "Relationship Resonance Map", href: "/relationship" },
  // 用户很可能搜的是"命硬吗""命硬不硬"这类口语，不是"生命韧性指数"这个
  // 正式产品名——之前这类搜索就是你说的"搜不到"的典型例子，这里把口语
  // 说法也写进标题里，搜索是简单的字符串匹配，标题里出现过的词才搜得到。
  { slug: "resilience", title: "生命韧性指数 · 命硬不硬测试", titleEn: "Life Resilience Index", href: "/resilience" },
  { slug: "romance", title: "桃花磁场指数", titleEn: "Romance Resonance Index", href: "/romance" },
  { slug: "daily", title: "今日潮汐 · 宇宙节律", titleEn: "Today’s Tide", href: "/daily" },
  { slug: "tarot", title: "灵犀量子生命镜像 · 与生命场建立连接", titleEn: "Lingxi Quantum Life Mirror · Connect with the Field", href: "/mirror" },
  { slug: "tarot-daily", title: "今日塔罗 · 每日一卡", titleEn: "Tarot · Daily Card", href: "/mirror/daily" },
  { slug: "qian", title: "灵犀生命灵签 · 意识坐标读取", titleEn: "Lingxi Life Oracle · Consciousness Coordinate Reading", href: "/qian" },
  { slug: "life-archetype", title: "生命原型 · 八域树突汇流", titleEn: "Life Archetype · Eight-Field Dendrite Convergence", href: "/archetype" },
];

// 输入框空着的时候，轮流显示几个真实存在的例子做提示——比干巴巴的
// "搜索星域故事、修炼技术"这种通用占位符，更能让人知道"原来可以搜这些"。
const PLACEHOLDER_HINTS = [
  { zh: "试试搜「共鸣礁」", en: 'Try "The Resonance Reef"' },
  { zh: "试试搜「量子息法」", en: 'Try "Quantum Breath Method"' },
  { zh: "试试搜「生命图谱」", en: 'Try "Life Map"' },
  { zh: "试试搜「显化」", en: 'Try "Manifestation"' },
];

type Ripple = { id: number; x: number; y: number };

export default function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hintIdx, setHintIdx] = useState(0);
  const seq = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const isEn = typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");

  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => (i + 1) % PLACEHOLDER_HINTS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { pages: [], stories: [] };
    const pages = STATIC_PAGES.filter(
      (p) => p.title.includes(q.trim()) || p.titleEn.toLowerCase().includes(query)
    ).slice(0, 4);
    const stories = NARRATIVES.filter(
      (n) =>
        n.title.includes(q.trim()) ||
        n.titleEn.toLowerCase().includes(query) ||
        n.teaser.includes(q.trim()) ||
        n.teaserEn.toLowerCase().includes(query)
    ).slice(0, 8);
    return { pages, stories };
  }, [q]);

  const hasResults = results.pages.length > 0 || results.stories.length > 0;

  const fireRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const r = { id: seq.current++, x: e.clientX - rect.left, y: e.clientY - rect.top };
    setRipples((prev) => [...prev.slice(-3), r]);
    setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== r.id)), 900);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goToTopResult = () => {
    // 之前这段逻辑只在桌面键盘的Enter事件里触发——手机上，虚拟键盘的
    // "完成"/"搜索"/"换行"这几个确认键，不是所有手机浏览器都会像
    // 桌面那样正确派发出一个keydown事件、key正好等于"Enter"，这是
    // 一个很常见的移动端坑，不是这个网站独有的问题。把逻辑提出来
    // 单独一个函数，配合下面的<form onSubmit>和一个真正可点的搜索
    // 按钮，不管手机键盘那个确认键靠不靠谱，点这个按钮永远有效。
    const query = q.trim();
    if (!query) return;
    const topPage = results.pages[0];
    const topStory = results.stories[0];
    const href = topPage
      ? topPage.href
      : topStory
      ? `/narrative/${topStory.slug}`
      : `/learn?q=${encodeURIComponent(query)}`;
    setFocused(false);
    router.push(href);
  };

  return (
    <div
      ref={boxRef}
      onMouseDown={fireRipple}
      className={`sb-box relative ${focused ? "sb-box-active" : ""} ${className}`}
    >
      {ripples.map((r) => (
        <span key={r.id} className="sb-ripple" style={{ left: r.x, top: r.y }} />
      ))}
      <form
        className="flex flex-1 items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          goToTopResult();
        }}
      >
      <svg className="sb-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        type="search"
        enterKeyHint="search"
        placeholder={isEn ? PLACEHOLDER_HINTS[hintIdx].en : PLACEHOLDER_HINTS[hintIdx].zh}
        className="sb-input"
      />
      {q && (
        <button
          type="button"
          aria-label="清空"
          onClick={() => setQ("")}
          className="sb-clear"
        >
          ×
        </button>
      )}
      {q && (
        <button
          type="submit"
          aria-label="搜索"
          className="sb-go"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-full w-full">
            <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
      </form>

      {focused && q && (
        <div className="sb-panel">
          {/* 这个"向灵犀提问"入口，这次特意放在结果列表最上方，而不是
             最下方——如果搜的词命中了好几篇多维叙事（很常见的词，比如
             "信息"，在150多篇故事的简介里，撞上的概率不低），下面这个
             面板本身有滚动、有最大高度限制，放在最下面的话，前面结果
             一多，这个入口就会被挤到要滚动到底才能看到的地方，等于
             "渲染了，但用户根本看不见、以为它不存在"。挪到最上面，
             不管上面搜到多少东西，这个入口都保证是打开面板第一眼就
             看到的内容。 */}
          <Link
            href={`/learn?q=${encodeURIComponent(q)}`}
            onClick={() => setFocused(false)}
            className="sb-ask-link"
          >
            <Bi zh={`向灵犀提问「${q}」→`} en={`Ask Lingxi about "${q}" →`} />
          </Link>
          {!hasResults && (
            <p className="sb-empty">
              <Bi zh="灵犀场里还没有这个" en="Not in the field yet" />
            </p>
          )}
          {results.pages.length > 0 && (
            <div className="sb-group">
              <div className="sb-group-label"><span data-lang="zh">页面</span><span data-lang="en">Pages</span></div>
              {results.pages.map((p) => (
                <Link
                  key={p.slug}
                  href={p.href}
                  onClick={() => setFocused(false)}
                  className="sb-item"
                >
                  <span>{p.title}</span>
                  <span className="sb-item-en">{p.titleEn}</span>
                </Link>
              ))}
            </div>
          )}
          {results.stories.length > 0 && (
            <div className="sb-group">
              <div className="sb-group-label"><span data-lang="zh">多维叙事</span><span data-lang="en">Narratives</span></div>
              {results.stories.map((n) => (
                <Link
                  key={n.slug}
                  href={`/narrative/${n.slug}`}
                  onClick={() => setFocused(false)}
                  className="sb-item"
                >
                  <span>{n.title}</span>
                  <span className="sb-item-en">{n.titleEn}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <style suppressHydrationWarning>{`
        .sb-box {
          display: flex; align-items: center; gap: 6px;
          width: 100%; max-width: 15rem;
          padding: 6px 10px;
          border-radius: 999px;
          position: relative;
          border: 1.5px solid transparent;
          background:
            linear-gradient(rgba(10,20,38,0.55), rgba(10,20,38,0.55)) padding-box,
            conic-gradient(from var(--sb-angle, 0deg), #D8B8FF, #94D8F0, #A0E0D0, #D8B8FF) border-box;
          animation: sb-spin 6s linear infinite;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: var(--text-primary, #DDE6FF);
          transition: box-shadow .25s ease, background .25s ease;
          overflow: hidden;
          cursor: text;
        }
        @property --sb-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes sb-spin {
          to { --sb-angle: 360deg; }
        }
        .sb-box-active, .sb-box:hover {
          box-shadow: 0 0 16px rgba(160,224,255,0.3), 0 4px 18px rgba(216,184,255,0.18);
          background:
            linear-gradient(rgba(10,20,38,0.68), rgba(10,20,38,0.68)) padding-box,
            conic-gradient(from var(--sb-angle, 0deg), #D8B8FF, #94D8F0, #A0E0D0, #D8B8FF) border-box;
        }
        .sb-box.sb-wide { max-width: none; }
        @media (prefers-reduced-motion: reduce) {
          .sb-box { animation: none; }
        }
        .sb-icon { width: 15px; height: 15px; flex: none; opacity: .85; }
        .sb-input {
          flex: 1; min-width: 0;
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #ede7dc;
        }
        .sb-input::placeholder { color: rgba(237,231,220,0.42); }
        .sb-clear {
          flex: none; font-size: 15px; line-height: 1; color: rgba(237,231,220,0.5);
          padding: 0 2px;
        }
        .sb-clear:hover { color: #e8b765; }
        .sb-go {
          flex: none; width: 22px; height: 22px; padding: 3px;
          color: rgba(237,231,220,0.7);
          border-radius: 999px;
          transition: color .15s ease, background .15s ease;
        }
        .sb-go:hover, .sb-go:active { color: #e8b765; background: rgba(232,183,101,0.12); }
        .sb-ripple {
          position: absolute; width: 6px; height: 6px; margin: -3px 0 0 -3px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,183,101,0.55), transparent 70%);
          animation: sb-ripple-grow .8s ease-out forwards;
          pointer-events: none;
        }
        @keyframes sb-ripple-grow {
          from { transform: scale(0.3); opacity: .8; }
          to   { transform: scale(14); opacity: 0; }
        }
        .sb-panel {
          position: absolute; left: 0; right: 0; top: calc(100% + 8px);
          max-height: 70vh; overflow-y: auto;
          background: linear-gradient(135deg, rgba(20,34,58,0.88) 0%, rgba(16,28,50,0.92) 100%);
          border: 1px solid var(--aurora-glass-border, rgba(160,224,255,0.5));
          border-radius: 14px;
          padding: 8px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(140,210,255,0.12);
          z-index: 60;
        }
        .sb-empty { padding: 14px 10px 4px; font-size: 13px; color: rgba(237,231,220,0.55); text-align: center; }
        .sb-empty-wrap { padding-bottom: 6px; }
        .sb-ask-link {
          display: block; margin: 4px 8px 8px; padding: 9px 10px;
          border-radius: 8px; text-align: center; font-size: 13px;
          color: #F0C868; background: rgba(240,200,104,0.1);
          border: 1px solid rgba(240,200,104,0.3);
          transition: background .15s ease;
        }
        .sb-ask-link:hover { background: rgba(240,200,104,0.2); }
        .sb-group + .sb-group { margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; }
        .sb-group-label { font-size: 11px; letter-spacing: .08em; color: rgba(124,224,211,0.75); padding: 4px 8px; }
        .sb-item {
          display: flex; flex-direction: column; gap: 1px;
          padding: 7px 10px; border-radius: 8px;
          color: #ede7dc; font-size: 13.5px;
          transition: background .15s ease;
        }
        .sb-item:hover { background: rgba(232,183,101,0.12); }
        .sb-item-en { font-size: 11px; color: rgba(237,231,220,0.45); }
      `}</style>
    </div>
  );
}
