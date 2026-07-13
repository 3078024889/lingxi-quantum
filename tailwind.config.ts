import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#eef4ff",
        "void-deep": "#f5eeff",
        lattice: "#0891b2",
        "lattice-dim": "#0e7490",
        amber: "#c98a1f",
        rose: "#d6389e",
        violet: "#8b5cf6",
        bone: "#2a2440",
        "bone-dim": "#5a5270",
        "lm-violet": "#8b5cf6",
        // 生命图谱主题：跟全站统一为同一套"黎明天空"亮色系，不再单独维护一套深色 token
        "lm2-bg": "#eef4ff",
        "lm2-bg-deep": "#f5eeff",
        "lm2-card": "rgba(255,255,255,0.55)",
        "lm2-text": "#2a2440",
        "lm2-text-dim": "#5a5270",
        "lm2-rose": "#d6389e",
        "lm2-amber": "#c98a1f",
        "lm2-mint": "#0d9488",
        "lm2-sky": "#0891b2",
        "lm2-violet": "#8b5cf6",
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
