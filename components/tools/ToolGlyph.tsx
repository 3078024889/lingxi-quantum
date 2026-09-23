"use client";

type Kind = "image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";

const GLYPHS: Record<Kind, { icon: string; bg: string }> = {
  image: { icon: "🖼️", bg: "linear-gradient(135deg,#ffe8f3,#fff3cf)" },
  document: { icon: "📄", bg: "linear-gradient(135deg,#e8f0ff,#eefcff)" },
  video: { icon: "🎬", bg: "linear-gradient(135deg,#efe7ff,#ffe8f6)" },
  audio: { icon: "🎙️", bg: "linear-gradient(135deg,#e8fff6,#e8f8ff)" },
  privacy: { icon: "🛡️", bg: "linear-gradient(135deg,#e7fff1,#eef7ff)" },
  utility: { icon: "🧰", bg: "linear-gradient(135deg,#fff0db,#fff8e8)" },
  ai: { icon: "✨", bg: "linear-gradient(135deg,#eee8ff,#e5f4ff)" },
  qr: { icon: "🔳", bg: "linear-gradient(135deg,#edf2ff,#f4ecff)" },
};

export default function ToolGlyph({kind}:{kind:Kind}) {
  const value = GLYPHS[kind] ?? GLYPHS.utility;
  return (
    <span
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        fontSize: 23,
        background: value.bg,
        boxShadow: "inset 0 0 0 1px rgba(15,23,42,.06)",
      }}
    >
      {value.icon}
    </span>
  );
}
