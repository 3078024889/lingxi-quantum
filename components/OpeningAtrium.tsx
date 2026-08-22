"use client";

import { useEffect, useRef, useState } from "react";

// Full-bleed entrance film — no side panels. Desktop plays the 16:9 cut,
// mobile plays its own 9:16 cut, chosen in JS below.
//
// v304: switched away from <video><source media="..."> for picking the
// right file. That attribute is meant for <picture>, and support for it on
// <video>/<source> is inconsistent across mobile browsers and WeChat's
// embedded webview (X5/xweb) — some of them just ignore the media query and
// always load the first <source>. We pick the URL in JS with
// window.matchMedia and render a single <video src="..."> element, which
// every platform handles the same way.
//
// v304: also re-encoded both source films to H.264 — the originals were
// HEVC, which only decodes reliably in Safari/iOS.
//
// v307: dropped the old 3-column layout (video in the middle, static
// character art on either side). It's a single full-screen video now on
// every breakpoint, same as mobile always was.
const DESKTOP_BREAKPOINT = "(min-width: 1024px)";
const ASSET_VERSION = "20260822-v304";
const DESKTOP_POSTER = `/images/entrance/lingxi-opening-poster-desktop.jpg?v=${ASSET_VERSION}`;
const DESKTOP_VIDEO_MP4 = `/images/entrance/lingxi-opening-desktop.mp4?v=${ASSET_VERSION}`;
const MOBILE_POSTER = `/images/entrance/lingxi-opening-poster-mobile.jpg?v=${ASSET_VERSION}`;
const MOBILE_VIDEO_MP4 = `/images/entrance/lingxi-opening-mobile.mp4?v=${ASSET_VERSION}`;

export default function OpeningAtrium() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [ended, setEnded] = useState(false);
  // Lazy-initialized so the client's first render already reads the real
  // viewport (avoids a poster flash/swap after hydration).
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP_BREAKPOINT).matches
  );
  const POSTER = isDesktop ? DESKTOP_POSTER : MOBILE_POSTER;
  const VIDEO_SRC = isDesktop ? DESKTOP_VIDEO_MP4 : MOBILE_VIDEO_MP4;

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_BREAKPOINT);
    setIsDesktop(mql.matches);
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set both muted properties before play so iOS Safari and WeChat WebView
    // can follow the permitted inline muted-autoplay path.
    video.defaultMuted = true;
    video.muted = true;
    setAutoplayBlocked(false);
    setEnded(false);
    video.load();
    void video.play().catch(() => setAutoplayBlocked(true));
    // Re-run whenever the source actually changes (viewport crossing the
    // desktop breakpoint), so the new file is loaded and (re)played.
  }, [VIDEO_SRC]);

  const enterField = () => setVisible(false);

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (video.paused) {
      await video.play().catch(() => setAutoplayBlocked(true));
    }
  };

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (ended) video.currentTime = 0;
    setEnded(false);
    await video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
  };

  if (!visible) return null;

  return (
    <section
      aria-label="灵犀场入场门厅"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#030214] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(114,76,210,.28),rgba(3,2,20,.96)_72%)]" />

      <div className="relative h-[100dvh] w-full overflow-hidden bg-[#080622] shadow-[0_0_70px_rgba(126,90,255,.28)]">
        {videoAvailable ? (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted={muted}
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            preload="auto"
            poster={POSTER}
            onCanPlay={() => {
              const video = videoRef.current;
              if (video?.paused && !ended) void video.play().catch(() => setAutoplayBlocked(true));
            }}
            onPlay={() => setAutoplayBlocked(false)}
            onEnded={() => setEnded(true)}
            onError={() => setVideoAvailable(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${POSTER})` }} />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030214]/45 via-transparent to-[#030214]/70" />

        <div className="pointer-events-none absolute inset-x-0 top-[12%] z-[6] px-5 text-center text-white [text-shadow:0_2px_22px_rgba(3,2,20,.95)] sm:top-[14%]">
          <p className="font-display text-3xl font-light tracking-[0.24em] sm:text-4xl">灵犀场</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.48em] text-cyan-100/90">Lingxi Field</p>
          <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent" />
        </div>

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <button
            type="button"
            onClick={toggleSound}
            disabled={!videoAvailable}
            className="border border-white/35 bg-[#05031a]/55 px-4 py-2.5 text-xs tracking-[0.12em] text-white/90 backdrop-blur-md transition hover:border-cyan-200 hover:text-cyan-100 disabled:opacity-50"
          >
            {muted ? "开启声音" : "静音播放"}
          </button>
          <button
            type="button"
            onClick={enterField}
            className="border border-cyan-100/60 bg-[#05031a]/55 px-4 py-2.5 text-xs tracking-[0.12em] text-cyan-50 backdrop-blur-md transition hover:bg-cyan-100 hover:text-[#08071c]"
          >
            跳过 · 进入灵犀场
          </button>
        </div>

        {(autoplayBlocked || ended) && videoAvailable && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center px-6">
            <button
              type="button"
              onClick={playVideo}
              className="border border-cyan-100/75 bg-[#07051d]/60 px-7 py-4 font-display text-sm tracking-[0.18em] text-cyan-50 shadow-[0_0_38px_rgba(140,225,255,.22)] backdrop-blur-md transition hover:bg-cyan-100 hover:text-[#08071c]"
            >
              {ended ? "重新播放入场影像" : "播放入场影像"}
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8 text-center sm:px-8">
          <p className="font-display text-[11px] uppercase tracking-[0.34em] text-cyan-100/90">Lingxi Field · Opening</p>
          <p className="mt-2 font-display text-sm tracking-[0.24em] text-violet-100/90">观测 · 觉察 · 连接</p>
          <button
            type="button"
            onClick={enterField}
            className="mt-4 w-full border border-cyan-200/60 bg-cyan-100/10 py-3.5 font-display text-sm tracking-[0.16em] text-cyan-50 backdrop-blur-md transition hover:bg-cyan-100 hover:text-[#08071c]"
          >
            进入灵犀场
          </button>
        </div>
      </div>
    </section>
  );
}
