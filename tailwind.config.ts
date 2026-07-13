import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#16101f",
        "void-deep": "#0f0a1a",
        lattice: "#5FE8FF",
        "lattice-dim": "#3E7C76",
        amber: "#FFCB61",
        rose: "#FF8FD1",
        violet: "#C79CFF",
        bone: "#EDE7DC",
        "bone-dim": "#A8A096",
        "lm-violet": "#C9A5D8",
        // 生命图谱亮色主题（v2）：温暖米白背景 + 极光光谱强调色，
        // 生命图谱主题（v3）：暮光宇宙 + 玻璃质感 + 彩虹能量场——不是纯黑不是纯白，
        // 深紫蓝底色配月光白文字，保证对比度；前缀 lm2- 与全站现有深色主题完全隔离
        "lm2-bg": "#1c1830",
        "lm2-bg-deep": "#141221",
        "lm2-card": "rgba(255,255,255,0.07)",
        "lm2-text": "#F4EFFF",
        "lm2-text-dim": "#C9C4E8",
        "lm2-rose": "#FF9CD8",
        "lm2-amber": "#FFD68A",
        "lm2-mint": "#7FE7C4",
        "lm2-sky": "#7FE7FF",
        "lm2-violet": "#D89CFF",
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
      },
    },
  },
  plugins: [],
};
export default config;
