"use client";

import { useEffect, useRef, useState } from "react";

const POSTER = "/images/entrance/lingxi-opening-poster.jpg";
const VIDEO_MP4 = "/images/entrance/lingxi-opening.mp4";
const STORAGE_KEY = "lingxi-opening-atrium-seen-v1";

export default function OpeningAtrium() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("skipIntro") === "1" || localStorage.getItem(STORAGE_KEY)) {
      setVisible(false);
      setChecked(true);
      return;
    }
    setVisible(true);
    setChecked(true);
  }, []);

  const enter = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const playOpening = async () => {
    const video = videoRef.current;
    if (!video || !videoAvailable) {
      enter();
      return;
    }
    try {
      await video.play();
      setPlaying(true);
    } catch {
      // Keep the poster and offer a clear direct entrance if the device blocks
      // inline MP4 playback. A tap must never appear to do nothing.
      setVideoAvailable(false);
    }
  };

  // Avoid SSR rendering the poster, then hiding it one frame later when the
  // browser reads its saved "seen" state. That was the visible flash on return.
  if (!checked || !visible) return null;

  return (
    <section
      aria-label="灵犀场开场门厅"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#05031a] text-white"
    >
      <div className="absolute inset-y-0 left-0 hidden w-[27vw] lg:block" style={{ backgroundImage: `url(${POSTER})`, backgroundPosition: "left center", backgroundSize: "cover" }} />
      <div className="absolute inset-y-0 right-0 hidden w-[27vw] lg:block" style={{ backgroundImage: `url(${POSTER})`, backgroundPosition: "right center", backgroundSize: "cover" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(71,50,145,.18),rgba(4,3,19,.82)_70%)]" />

      <div className="relative mx-auto flex h-full max-w-[1800px] items-center justify-center px-3 py-3 sm:px-6 sm:py-6">
        <div className="relative h-full max-h-[1000px] w-full max-w-[min(56.25vh,620px)] overflow-hidden border border-violet-200/35 bg-[#0b1030] shadow-[0_0_80px_rgba(139,104,255,.35)]">
          {videoAvailable ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              x5-video-player-type="h5"
              x5-video-player-fullscreen="false"
              preload="metadata"
              poster={POSTER}
              onCanPlay={() => setReady(true)}
              onPlay={() => setPlaying(true)}
              onEnded={() => {
                setEnded(true);
                setPlaying(false);
              }}
              onError={() => setVideoAvailable(false)}
            >
              <source src={VIDEO_MP4} type="video/mp4" />
            </video>
          ) : (
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${POSTER})` }} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05031a]/70 via-transparent to-[#05031a]/20" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
            <p className="font-display text-[10px] uppercase tracking-[0.35em] text-cyan-200/90">Lingxi Field · Opening</p>
            <button onClick={enter} className="border border-white/35 bg-[#08071c]/45 px-3 py-2 text-xs tracking-[0.12em] text-white/90 backdrop-blur-sm transition hover:border-cyan-200 hover:text-cyan-100">
              跳过 · 进入场域
            </button>
          </div>
          {!playing && !ended && (
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-6">
              <button
                onClick={playOpening}
                disabled={videoAvailable && !ready}
                className="border border-cyan-100/75 bg-[#090820]/55 px-6 py-4 font-display text-sm tracking-[0.18em] text-cyan-50 shadow-[0_0_38px_rgba(140,225,255,.22)] backdrop-blur-sm transition hover:border-white hover:bg-cyan-100 hover:text-[#08071c] disabled:cursor-wait disabled:opacity-70"
              >
                {videoAvailable ? (ready ? "播放开场短剧" : "正在准备开场短剧") : "进入灵犀场"}
              </button>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 text-center sm:p-9">
            <p className="font-display text-sm tracking-[0.24em] text-violet-100/90">观测 · 觉察 · 连接</p>
            <button onClick={enter} className="mt-4 border border-cyan-200/60 bg-cyan-100/10 px-7 py-3 font-display text-sm tracking-[0.16em] text-cyan-50 transition hover:bg-cyan-100 hover:text-[#08071c]">
              直接进入场域
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
