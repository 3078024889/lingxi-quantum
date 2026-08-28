"use client";

import Link from "next/link";
import { PointerEvent, useEffect, useRef, useState } from "react";
import SearchBox from "@/components/SearchBox";
import { FIELD_STRUCTURE_LINKS } from "@/lib/field-structure-links";
import styles from "./FieldStructure9D.module.css";

const VIDEO_SRC = "/media/lingxifield-9d-field-structure-v317-h264.mp4";
const POSTER_SRC = "/images/9d-field-structure-poster-v316.png";
const MAP_SRC = "/images/9d-field-navigation-v317.png";

type Position = { x: number; y: number } | null;
type DragState = { pointerId: number; x: number; y: number; left: number; top: number; width: number; height: number } | null;

function useFloatingDrag(disabled: boolean) {
  const [position, setPosition] = useState<Position>(null);
  const dragRef = useRef<DragState>(null);
  const start = (event: PointerEvent<HTMLElement>) => {
    if (disabled || event.button !== 0) return;
    const rect = event.currentTarget.closest("aside")?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPosition({
      x: Math.max(12, Math.min(window.innerWidth - drag.width - 12, drag.left + event.clientX - drag.x)),
      y: Math.max(12, Math.min(window.innerHeight - drag.height - 12, drag.top + event.clientY - drag.y)),
    });
  };
  const end = (event: PointerEvent<HTMLElement>) => { if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null; };
  return { position, dragHandlers: { onPointerDown: start, onPointerMove: move, onPointerUp: end, onPointerCancel: end } };
}

function FloatingFieldNavigator() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { position, dragHandlers } = useFloatingDrag(expanded);
  return <aside className={`${styles.navigatorRoot} ${open ? styles.open : styles.closed} ${expanded ? styles.expanded : ""}`} style={!expanded && position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined} aria-label="9D 场域导航">
    {!open ? <button className={`${styles.crystal} ${styles.navCrystal}`} type="button" onClick={() => setOpen(true)} aria-label="打开 9D 场域导航"><span>9D</span><small>场域导航</small></button> :
      <div className={`${styles.panel} ${styles.navigatorPanel}`} role="dialog" aria-modal={expanded ? "true" : "false"} aria-label="灵犀场 9D 场域导航">
        <header className={styles.header} {...dragHandlers}><div><p className={styles.kicker}>9D FIELD NAVIGATION</p><h2>灵犀场 · 场域结构导航</h2><p>拖动窗口 · 点击场域节点进入</p></div><span className={styles.dragHint}>✦ 拖动</span></header>
        <div className={styles.navTools}><Link href="/learn">探索</Link><div className={styles.search}><SearchBox /></div><Link href="/membership">能量交换</Link><Link href="/account" className={styles.portal}>场域入口</Link></div>
        <div className={styles.map}>
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={MAP_SRC} alt="灵犀场 9D 可交互产品结构导航图" />
          {FIELD_STRUCTURE_LINKS.map((item) => <Link key={item.href} href={item.href} className={styles.hotspot} style={{ left: `${item.x}%`, top: `${item.y}%` }} title={`${item.zh} · ${item.en}`} onClick={() => { setOpen(false); setExpanded(false); }}><span>{item.zh}</span></Link>)}
        </div>
        <div className={styles.actions}><button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "缩小" : "展开导航"}</button><button type="button" onClick={() => { setExpanded(false); setOpen(false); }}>收起</button></div>
      </div>}
  </aside>;
}

function FloatingFieldVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(true);
  const { position, dragHandlers } = useFloatingDrag(expanded);
  useEffect(() => { if (window.matchMedia("(min-width: 769px)").matches) setOpen(true); }, []);
  useEffect(() => { if (open) void videoRef.current?.play().catch(() => undefined); }, [open]);
  return <aside className={`${styles.videoRoot} ${open ? styles.open : styles.closed} ${expanded ? styles.expanded : ""}`} style={!expanded && position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined} aria-label="9D 场域结构影片">
    {!open ? <button className={`${styles.crystal} ${styles.videoCrystal}`} type="button" onClick={() => setOpen(true)} aria-label="打开 9D 场域结构影片"><span>9D</span><small>结构影片</small></button> :
      <div className={`${styles.panel} ${styles.videoPanel}`} role="dialog" aria-modal={expanded ? "true" : "false"} aria-label="灵犀场 9D 产品结构影片">
        <header className={styles.header} {...dragHandlers}><div><p className={styles.kicker}>9D FIELD STRUCTURE</p><h2>灵犀场 · 9D 产品结构</h2><p>意识为核心，八域相连，场域持续展开</p></div><span className={styles.dragHint}>✦ 拖动</span></header>
        <div className={styles.media}><video ref={videoRef} src={VIDEO_SRC} poster={POSTER_SRC} muted={muted} autoPlay loop playsInline preload="metadata" controls={expanded} /></div>
        <div className={styles.actions}><button type="button" onClick={() => { setMuted((value) => !value); void videoRef.current?.play().catch(() => undefined); }}>{muted ? "开启声音" : "静音"}</button><button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "缩小" : "展开查看"}</button><button type="button" onClick={() => { videoRef.current?.pause(); setExpanded(false); setOpen(false); }}>收起</button></div>
      </div>}
  </aside>;
}

/** Desktop uses two independent floating surfaces: navigation and film. */
export default function FieldStructure9D() {
  const [embedded, setEmbedded] = useState(true);
  useEffect(() => setEmbedded(new URLSearchParams(window.location.search).get("mini") === "1"), []);
  if (embedded) return null;
  return <><FloatingFieldNavigator /><FloatingFieldVideo /></>;
}
