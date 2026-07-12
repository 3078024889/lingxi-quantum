import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#06050A",
        "void-deep": "#020103",
        lattice: "#7CE0D3",
        "lattice-dim": "#3E7C76",
        amber: "#E8B765",
        rose: "#C77D9C",
        bone: "#EDE7DC",
        "bone-dim": "#A8A096",
        "lm-violet": "#C9A5D8",
        // 生命图谱亮色主题（v2）：温暖米白背景 + 极光光谱强调色，
        // 专为强光环境下的可读性设计，前缀 lm2- 与全站现有深色主题完全隔离
        "lm2-bg": "#FBF8F2",
        "lm2-bg-deep": "#F2ECDF",
        "lm2-card": "#FFFDF8",
        "lm2-text": "#2E2740",
        "lm2-text-dim": "#6E6580",
        "lm2-rose": "#E8869E",
        "lm2-amber": "#E7B85C",
        "lm2-mint": "#5FC79B",
        "lm2-sky": "#5A9FDE",
        "lm2-violet": "#A47ADC",
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
          "linear-gradient(90deg, #E8869E, #E7B85C, #5FC79B, #5A9FDE, #A47ADC)",
        "lm2-aurora-soft":
          "linear-gradient(135deg, rgba(232,134,158,0.18), rgba(231,184,92,0.16), rgba(95,199,155,0.16), rgba(90,159,222,0.16), rgba(164,122,220,0.18))",
      },
    },
  },
  plugins: [],
};
export default config;
