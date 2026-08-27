"use client";

import Link from "next/link";
import { PointerEvent, useEffect, useRef, useState } from "react";
import { FIELD_STRUCTURE_LINKS } from "@/lib/field-structure-links";
import styles from "./FieldStructure9D.module.css";

const VIDEO_SRC = "/media/lingxifield-9d-field-structure-v317-h264.mp4";
const POSTER_SRC = "/images/9d-field-structure-poster-v316.png";

/**
 * A global map of the Lingxi Field product system.
 * Desktop keeps a small, non-blocking window on the right. Mobile only shows
 * the 9D crystal trigger and opens the film in a bottom sheet.
 */
export default function FieldStructure9D() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [embedded, setEmbedded] = useState(true);
  const [mapMode, setMapMode] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  useEffect(() => {
    const isEmbedded = new URLSearchParams(window.location.search).get("mini") === "1";
    setEmbedded(isEmbedded);
    if (!isEmbedded && window.matchMedia("(min-width: 769px)").matches) setOpen(true);
  }, []);

  useEffect(() => {
    if (open) void videoRef.current?.play().catch(() => undefined);
  }, [open]);

  if (embedded) return null;

  const beginDrag = (event: PointerEvent<HTMLElement>) => {
    if (expanded || window.matchMedia("(max-width: 768px)").matches) return;
    const rect = event.currentTarget.closest("aside")?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event: PointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    setPosition({
      x: Math.min(window.innerWidth - 380, Math.max(12, dragRef.current.left + event.clientX - dragRef.current.x)),
      y: Math.min(window.innerHeight - 220, Math.max(12, dragRef.current.top + event.clientY - dragRef.current.y)),
    });
  };
  const endDrag = () => { dragRef.current = null; };

  return (
    <aside className={`${styles.root} ${open ? styles.open : styles.closed} ${expanded ? styles.expanded : ""}`} style={!expanded && position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined} aria-label="9D 场域结构">
      {!open ? (
        <button className={styles.crystal} type="button" onClick={() => setOpen(true)} aria-label="打开 9D 场域结构">
          <span>9D</span>
          <small>场域结构</small>
        </button>
      ) : (
        <div className={styles.panel} role="dialog" aria-modal={expanded ? "true" : "false"} aria-label="灵犀场 9D 产品结构">
          <header className={styles.header} onPointerDown={beginDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div>
              <p className={styles.kicker}>9D FIELD STRUCTURE</p>
              <h2>灵犀场 · 9D 产品结构</h2>
              <p>意识为核心，八域相连，场域持续展开</p>
            </div>
          </header>
          <div className={styles.media}>
            {mapMode ? <div className={styles.map}>
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/9d-field-navigation-v317.png" alt="灵犀场 9D 可交互产品结构图" />
              {FIELD_STRUCTURE_LINKS.map((item) => <Link key={item.href} href={item.href} className={styles.hotspot} style={{ left: `${item.x}%`, top: `${item.y}%` }} title={`${item.zh} · ${item.en}`} onClick={() => { setOpen(false); setExpanded(false); }}><span>{item.zh}</span></Link>)}
            </div> : <video ref={videoRef} src={VIDEO_SRC} poster={POSTER_SRC} muted autoPlay loop playsInline preload="metadata" controls={expanded} />}
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => setMapMode((value) => !value)}>{mapMode ? "观看 9D" : "打开导航图"}</button>
            {!expanded && <button type="button" onClick={() => setExpanded(true)}>展开查看</button>}
            <button type="button" onClick={() => { setExpanded(false); setOpen(false); }}>收起</button>
          </div>
        </div>
      )}
    </aside>
  );
}
