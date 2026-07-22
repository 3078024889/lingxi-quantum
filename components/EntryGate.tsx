"use client";

import { useState, useEffect } from "react";
import Bi from "./Bi";
import SpiralField from "./SpiralField";

// ────────────────────────────────────────────────────────────────────
// 灵犀场 · 场域入口仪式
// ────────────────────────────────────────────────────────────────────
// 之前把这段"欢迎进入"文案直接改进了首页本身的第一屏——但小仙女要的
// 不是"改首页文案"，是"打开网站，先看到一个只有名字和介绍的独立
// 欢迎页，点进入场域，螺旋展开，再落到现在这个首页"，是一整个独立
// 的入口仪式，不是首页内容本身的一部分。这次单独做成一个覆盖全屏的
// 入口层，铺在首页最上面——不是新开一个URL（避免"首页到底是哪个
// 地址"这种SEO/分享链接的复杂度），是进入网站的第一个动作。
//
// 用 sessionStorage 记一次"已经进过场"——同一次访问里，在站内其他
// 页面之间跳转、或者刷新回首页，不会每次都重新看一遍入口仪式，只有
// 关掉浏览器/开新的会话，才会再看到一次。这是一个合理的默认设计，
// 如果想要"每次打开首页都重新展示"，告诉我，把这行判断去掉就行。
const SESSION_KEY = "lx-entered-field";

export default function EntryGate() {
  const [visible, setVisible] = useState(false);
  const [spiraling, setSpiraling] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    try {
      const alreadyEntered = sessionStorage.getItem(SESSION_KEY) === "1";
      if (!alreadyEntered) setVisible(true);
    } catch {
      // sessionStorage 在某些隐私模式下可能访问失败——失败就正常显示
      // 入口仪式，不影响使用，只是这种情况下没法"记住已经进过场"。
      setVisible(true);
    }
  }, []);

  const enter = () => {
    setSpiraling(true);
    setTimeout(() => {
      setFadingOut(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // 忽略——最多是下次刷新会再看到一次入口仪式，不影响核心功能。
      }
      setTimeout(() => setVisible(false), 700);
    }, 1800);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 text-center transition-opacity duration-700 ${fadingOut ? "opacity-0" : "opacity-100"}`}
      style={{ background: "rgba(5,4,14,0.55)" }}
    >
      <SpiralField active={spiraling} label="正在进入灵犀场……" />

      {!spiraling && (
        <>
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice sm:text-base" style={{ textShadow: "0 0 8px rgba(224,230,255,0.45)" }}>
            <Bi zh="欢迎进入" en="Welcome to" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-6xl" style={{ textShadow: "0 0 20px rgba(216,184,255,0.35)" }}>
            <Bi zh="灵犀场 · 意识显化系统" en="Lingxi Field · Manifestation System" />
          </h1>
          <p className="mx-auto mt-7 max-w-xl font-body text-base leading-9 text-bone-dim sm:text-lg">
            <Bi
              zh="一个探索意识、重塑潜意识、创造生命可能性的个人意识空间——融合生命图谱、潜意识探索、梦境智能、东方智慧与宇宙叙事，帮助你重新理解自己。灵犀不创造你的欲望，只提供一面镜子。"
              en="A personal consciousness space for exploring awareness, reshaping the subconscious, and creating new possibilities — combining life mapping, subconscious exploration, dream intelligence, Eastern wisdom, and cosmic narrative to help you understand yourself anew. Lingxi doesn't manufacture what you should want. It offers a mirror."
            />
          </p>
          <button
            onClick={enter}
            className="mt-12 bg-lm2-aurora px-12 py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(216,184,255,0.4)] transition hover:brightness-110"
          >
            <Bi zh="进入场域" en="Enter the Field" />
          </button>
        </>
      )}
    </div>
  );
}
