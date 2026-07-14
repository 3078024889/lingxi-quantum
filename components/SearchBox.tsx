"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { NARRATIVES } from "@/lib/narratives";

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
];

type Ripple = { id: number; x: number; y: number };

export default function SearchBox({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const seq = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={boxRef}
      onMouseDown={fireRipple}
      className={`sb-box relative ${focused ? "sb-box-active" : ""} ${className}`}
    >
      {ripples.map((r) => (
        <span key={r.id} className="sb-ripple" style={{ left: r.x, top: r.y }} />
      ))}
      <svg className="sb-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="搜索星域故事、修炼技术…"
        className="sb-input"
      />
      {q && (
        <button
          aria-label="清空"
          onClick={() => setQ("")}
          className="sb-clear"
        >
          ×
        </button>
      )}

      {focused && q && (
        <div className="sb-panel">
          {!hasResults && (
            <div className="sb-empty">没有找到匹配的内容，换个关键词试试</div>
          )}
          {results.pages.length > 0 && (
            <div className="sb-group">
              <div className="sb-group-label">页面</div>
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
              <div className="sb-group-label">多维叙事</div>
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

      <style>{`
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
        .sb-empty { padding: 14px 10px; font-size: 13px; color: rgba(237,231,220,0.55); text-align: center; }
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
