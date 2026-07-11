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
      },
    },
  },
  plugins: [],
};
export default config;
