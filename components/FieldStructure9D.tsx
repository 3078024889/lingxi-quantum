"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FieldStructure9D.module.css";

const VIDEO_SRC = "/media/lingxifield-9d-field-structure-v316.mp4";
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

  useEffect(() => {
    const isEmbedded = new URLSearchParams(window.location.search).get("mini") === "1";
    setEmbedded(isEmbedded);
    if (!isEmbedded && window.matchMedia("(min-width: 769px)").matches) setOpen(true);
  }, []);

  useEffect(() => {
    if (open) void videoRef.current?.play().catch(() => undefined);
  }, [open]);

  if (embedded) return null;

  return (
    <aside className={`${styles.root} ${open ? styles.open : styles.closed} ${expanded ? styles.expanded : ""}`} aria-label="9D 场域结构">
      {!open ? (
        <button className={styles.crystal} type="button" onClick={() => setOpen(true)} aria-label="打开 9D 场域结构">
          <span>9D</span>
          <small>场域结构</small>
        </button>
      ) : (
        <div className={styles.panel} role="dialog" aria-modal={expanded ? "true" : "false"} aria-label="灵犀场 9D 产品结构">
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>9D FIELD STRUCTURE</p>
              <h2>灵犀场 · 9D 产品结构</h2>
              <p>意识为核心，八域相连，场域持续展开</p>
            </div>
          </header>
          <div className={styles.media}>
            <video ref={videoRef} src={VIDEO_SRC} poster={POSTER_SRC} muted autoPlay loop playsInline preload="metadata" controls={expanded} />
          </div>
          <div className={styles.actions}>
            {!expanded && <button type="button" onClick={() => setExpanded(true)}>展开查看</button>}
            <button type="button" onClick={() => { setExpanded(false); setOpen(false); }}>收起</button>
          </div>
        </div>
      )}
    </aside>
  );
}
