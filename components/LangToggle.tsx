"use client";

import { useEffect, useState } from "react";

export default function LangToggle() {
  const [en, setEn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lingxi-lang");
    if (saved === "en") {
      document.documentElement.classList.add("lang-en");
      setEn(true);
    }
  }, []);

  const toggle = () => {
    const next = !en;
    setEn(next);
    if (next) {
      document.documentElement.classList.add("lang-en");
      localStorage.setItem("lingxi-lang", "en");
    } else {
      document.documentElement.classList.remove("lang-en");
      localStorage.setItem("lingxi-lang", "zh");
    }
  };

  return (
    <button
      onClick={toggle}
      className="rounded-sm border border-white/15 px-2.5 py-1 font-display text-xs tracking-widest2 text-bone-dim transition hover:border-lattice/50 hover:text-lattice"
      aria-label="切换语言 / Switch language"
    >
      {en ? "中文" : "EN"}
    </button>
  );
}
