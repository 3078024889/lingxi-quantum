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

        // ===== Lingxi Typography System V3 =====
        // 白/蓝/金三色互抢主视觉的问题——三个颜色饱和度、亮度都很接近，
        // 长时间看会刺眼、发冷、注意力分散。这版换成一套主次分明、饱和度
        // 收敛的五层文字色：正文不用纯白（月雾紫白），标题比正文亮一档但
        // 依然克制（星辉银），强调色不用纯青蓝改用更绿一分的灵犀青玉
        // （避免跟蓝紫色背景"融在一起"），金色收窄成古星金、只用于极少量
        // 的印记性文字（章节号、核心符号），不再大面积铺开。
        lattice: "#8EDBD2",
        "lattice-dim": "#6BB8B0",
        amber: "#D6B77A",
        rose: "#FF9FD6",
        violet: "#C9A6FF",
        bone: "#DDD8EA",
        "bone-dim": "#9893B0",
        title: "#ECE5F5",
        "lm-violet": "#C9A6FF",
        // 生命图谱主题：文字令牌跟全站同一套 Lingxi Typography System
        "lm2-bg": "#0c1a30",
        "lm2-bg-deep": "#0f2038",
        "lm2-card": "rgba(14,28,52,0.55)",
        "lm2-text": "#DDD8EA",
        "lm2-text-dim": "#9893B0",
        "lm2-title": "#ECE5F5",
        "lm2-rose": "#FF9FD6",
        "lm2-amber": "#D6B77A",
        "lm2-mint": "#8EDBD2",
        "lm2-sky": "#8EDBD2",
        "lm2-violet": "#C9A6FF",
        // 供组件直接引用的文字系统主色
        pearl: "#DDD8EA",
        gold: "#D6B77A",
        "aurora-cyan": "#8EDBD2",
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
