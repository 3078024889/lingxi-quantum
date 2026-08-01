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
        lattice: "#76F5E5",
        "lattice-dim": "#7CC4B4",
        amber: "#C78BFF",
        // v281：原 #FF9FD6 太艳，压在桃花 PDF 的粉色底上几乎糊掉。
        // 柔化并提亮，只作强调用，不再当正文色。
        rose: "#E8B8D4",
        violet: "#D8B8FF",
        // v277：正文不用纯白。效果图那个感觉的关键之一，是文字带一点
        // 蓝紫，与深蓝紫的底同源，读起来像"从同一片光里长出来"，
        // 而纯白永远像"贴上去的"。降幅很小，可读性不受影响。
        bone: "#F2EEFF",
        "bone-dim": "#D7E5FF",
        // v274：新增两档实色。之前大量文字用 text-bone-dim/70、/85 这类
        // 透明度稀释，压在极光背景上实际亮度只剩七八成，远看就"糊"进背景，
        // 这是"字太浅、没有打开欲望"的技术根因。改用实色，亮度可控。
        "bone-soft": "#D7E5FF",
        "bone-mute": "#B2BACE",
        title: "#F0E6FF",
        "lm-violet": "#D8B8FF",
        // 生命图谱主题：文字令牌跟全站同一套 Lingxi Typography System V4
        // v281：生命图谱原本自带一整套独立主题（lm2-*），跟全站的
        // bone / lattice / lx-glass 完全无关——这就是为什么前几版改
        // 全站视觉时，生命图谱一直纹丝不动。363 处引用散在 5 个组件里，
        // 逐个替换风险大且容易漏，所以改法是：保留变量名，把它们的值
        // 对齐到全站新色板。一次生效，不动任何组件代码。
        "lm2-bg": "rgba(62,58,96,0.58)",        // 对齐雾玻璃底
        "lm2-bg-deep": "rgba(52,48,84,0.62)",
        "lm2-card": "rgba(96,86,132,0.50)",     // 对齐雾玻璃亮侧
        "lm2-text": "#F2EEFF",                  // 对齐 bone
        "lm2-text-dim": "#D7E5FF",              // 对齐 bone-dim
        "lm2-title": "#F2EEFF",
        "lm2-rose": "#D8A8C8",                  // 柔化，原 #FF9FD6 过艳
        "lm2-amber": "#C9A8D8",                 // 对齐 amber
        "lm2-mint": "#9FD8D0",                  // 对齐 lattice
        "lm2-sky": "#9FD8D0",
        "lm2-violet": "#C9A8D8",
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
