import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ===== Rainbow Celestial Aurora Design System =====
        // 深色玻璃卡片基底（Aurora Crystal Glass）。
        void: "#0c1a30",
        "void-deep": "#0f2038",

        // ===== Lingxi Typography System V4（多轮迭代后的定版色值） =====
        lattice: "#9FD8D0",
        "lattice-dim": "#7CC4B4",
        amber: "#C9A8D8",
        rose: "#FF9FD6",
        violet: "#D8B8FF",
        // v277：正文不用纯白。效果图那个感觉的关键之一，是文字带一点
        // 蓝紫，与深蓝紫的底同源，读起来像"从同一片光里长出来"，
        // 而纯白永远像"贴上去的"。降幅很小，可读性不受影响。
        bone: "#DCD7EA",
        "bone-dim": "#C2C8D8",
        // v274：新增两档实色。之前大量文字用 text-bone-dim/70、/85 这类
        // 透明度稀释，压在极光背景上实际亮度只剩七八成，远看就"糊"进背景，
        // 这是"字太浅、没有打开欲望"的技术根因。改用实色，亮度可控。
        "bone-soft": "#C2C8D8",
        "bone-mute": "#B2BACE",
        title: "#F0E6FF",
        "lm-violet": "#D8B8FF",
        // 生命图谱主题：文字令牌跟全站同一套 Lingxi Typography System V4
        "lm2-bg": "#0c1a30",
        "lm2-bg-deep": "#0f2038",
        "lm2-card": "rgba(14,28,52,0.55)",
        "lm2-text": "#F4F7FF",
        "lm2-text-dim": "#D2DEF5",
        "lm2-title": "#F0E6FF",
        "lm2-rose": "#FF9FD6",
        "lm2-amber": "#D8B8FF",
        "lm2-mint": "#A0E0D0",
        "lm2-sky": "#A0E0D0",
        "lm2-violet": "#D8B8FF",
        // 供组件直接引用的文字系统主色
        pearl: "#DDE6FF",
        gold: "#D8B8FF",
        "aurora-cyan": "#A0E0D0",
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
