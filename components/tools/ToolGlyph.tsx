"use client";

type Kind = "image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const GLYPHS: Record<Kind, { icon: string; bg: string; fg:string }> = {
  image: { icon: "◉", bg: "linear-gradient(135deg,#fff1f7,#fff8dc)", fg:"#e45b91" },
  document: { icon: "▤", bg: "linear-gradient(135deg,#eef4ff,#f0fbff)", fg:"#5279d8" },
  video: { icon: "▷", bg: "linear-gradient(135deg,#f2edff,#fff0f7)", fg:"#8c63d8" },
  audio: { icon: "∿", bg: "linear-gradient(135deg,#ecfff8,#edf9ff)", fg:"#2fa88f" },
  privacy: { icon: "◇", bg: "linear-gradient(135deg,#ecfff4,#f2f8ff)", fg:"#319b6b" },
  utility: { icon: "✦", bg: "linear-gradient(135deg,#fff6df,#fff0e8)", fg:"#d48536" },
  ai: { icon: "✧", bg: "linear-gradient(135deg,#f4efff,#edf7ff)", fg:"#7b65d9" },
  qr: { icon: "⌗", bg: "linear-gradient(135deg,#eef3ff,#f7efff)", fg:"#6078c8" },
};

export default function ToolGlyph({kind}:{kind:Kind}) {
  const value = GLYPHS[kind] ?? GLYPHS.utility;
  return (
    <span
      aria-hidden="true"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        fontSize: 19,
        fontWeight: 700,
        lineHeight: 1,
        color: value.fg,
        background: value.bg,
        boxShadow: "inset 0 0 0 1px rgba(15,23,42,.055),0 5px 16px rgba(45,65,95,.055)",
      }}
    >
      {value.icon}
    </span>
  );
}
