import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ===== Rainbow Celestial Aurora Design System =====
        // 深色玻璃卡片基底（Aurora Crystal Glass）。之前 void/lm2-bg 这套是
        // 浅色（#eef4ff），配合当年的浅色渐变背景；现在全站背景是真实的
        // 夜空极光视频/深色星云渐变，卡片基底也整体反转成深色玻璃——
        // 这样文字（珍珠白/黄金/极光青）天然就有对比度，不需要再叠光晕
        // 之类的补丁。
        void: "#141230",
        "void-deep": "#1b1740",
        lattice: "#7FEFE0",
        "lattice-dim": "#5FD4C4",
        amber: "#F0C868",
        rose: "#FF9FD6",
        violet: "#C9A6FF",
        bone: "#F7F3EA",
        "bone-dim": "#D9D3E8",
        "lm-violet": "#C9A6FF",
        // 生命图谱主题：跟全站统一为同一套"极光水晶"深色系
        "lm2-bg": "#141230",
        "lm2-bg-deep": "#1b1740",
        "lm2-card": "rgba(22,19,48,0.55)",
        "lm2-text": "#F7F3EA",
        "lm2-text-dim": "#D9D3E8",
        "lm2-rose": "#FF9FD6",
        "lm2-amber": "#F0C868",
        "lm2-mint": "#7FEFE0",
        "lm2-sky": "#8FD8FF",
        "lm2-violet": "#C9A6FF",
        // 珍珠白 / 黄金 / 极光青——文字系统三主色，供组件直接引用
        pearl: "#F7F3EA",
        gold: "#F0C868",
        "aurora-cyan": "#7FEFE0",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(circle at 50% 30%, rgba(124,224,211,0.08), transparent 60%)",
        "lm2-aurora":
          "linear-gradient(135deg, #7CE7FF, #CFA8FF, #FFD98A)",
        "lm2-aurora-soft":
          "linear-gradient(135deg, rgba(124,231,255,0.18), rgba(207,168,255,0.16), rgba(255,217,138,0.16))",
        "lm2-nebula":
          "radial-gradient(circle at 20% 10%, rgba(255,190,230,0.22), transparent 35%)," +
          "radial-gradient(circle at 80% 20%, rgba(120,220,255,0.22), transparent 40%)," +
          "radial-gradient(circle at 50% 90%, rgba(255,210,120,0.18), transparent 35%)," +
          "linear-gradient(135deg, #171526, #25203b, #182b38)",
        "aurora-ring":
          "linear-gradient(135deg, #F0C868, #FF9FD6, #C9A6FF, #7FEFE0, #F0C868)",
      },
    },
  },
  plugins: [],
};
export default config;
