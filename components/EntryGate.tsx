"use client";

import { useState, useEffect } from "react";
import Bi from "./Bi";
import SpiralField from "./SpiralField";

// ────────────────────────────────────────────────────────────────────
// 灵犀场 · 场域入口仪式
// ────────────────────────────────────────────────────────────────────
// 这次重做了两处实际问题：
// 1. 之前的背景是半透明的（rgba里带了透明度），身后的首页内容会
//    透出来，看起来像"两层内容叠在一起"——这次改成完全不透明的
//    实心背景，是真正独立的一屏，不是盖在首页上的一层半透明纱。
// 2. 左上角加了真实的场域标记（RuneIcon的"mark"图标，是全站导航栏
//    用的同一个标记，不是另外画一个新图标）——参考图2那种"金色圆形
//    LINGXIFIELD纹章"那张具体的图片，我这边拿不到文件本身（那是
//    你让GPT生成的一张具体图片，我这个环境没有这个文件），只能
//    用代码画——这次用的是全站本来就在用的同一个标记，保持视觉
//    统一，不是从图2里抠出来的那张图。
//
// 只有一屏：名字+介绍+按钮，点击后螺旋展开，停留一下再淡出，露出
// 身后的首页——像文档说的"跨越时空来到首页"，不分多屏。
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
        // 忽略——最多是下次刷新会再看到一次入口仪式。
      }
      setTimeout(() => setVisible(false), 700);
    }, 1800);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void px-6 text-center transition-opacity duration-700 ${fadingOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* 左上角场域标记——用的是你自己生成的那张LOGO图片文件 */}
      <div className="absolute left-6 top-6 flex items-center gap-2 sm:left-10 sm:top-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/lingxifield-logo.png" alt="LINGXIFIELD" className="h-10 w-10 sm:h-12 sm:w-12" />
        <span className="font-display text-xs uppercase tracking-widest2 text-bone-dim sm:text-sm">
          LINGXIFIELD
        </span>
      </div>

      <SpiralField active={spiraling} label="正在进入灵犀场……" />

      {!spiraling && (
        <>
          <h1 className="font-display text-4xl font-light text-bone sm:text-6xl" style={{ textShadow: "0 0 20px rgba(216,184,255,0.35)" }}>
            <Bi zh="你不是在寻找答案" en="You are not searching for an answer" />
          </h1>
          <p className="mt-4 font-display text-2xl font-light text-lattice sm:text-3xl">
            <Bi zh="是在重新认识，那个一直与你同在的自己" en="You are rediscovering the self that has always been with you" />
          </p>
          <p className="mx-auto mt-8 max-w-xl font-body text-base leading-9 text-bone-dim sm:text-lg">
            <Bi
              zh="灵犀场融合生命图谱、潜意识探索、梦境智能、东方智慧与宇宙叙事——不替你定义答案，只提供一面镜子，照见你早已知道、却被日常噪音盖住的那部分。"
              en="Lingxi Field brings together life mapping, subconscious exploration, dream intelligence, Eastern wisdom, and cosmic narrative — it defines no answer for you. It offers only a mirror, reflecting what you already knew before the noise of daily life covered it over."
            />
          </p>
          <button
            onClick={enter}
            className="mt-12 bg-lm2-aurora px-12 py-4 font-display text-sm uppercase tracking-widest2 text-[#151222] shadow-[0_0_30px_rgba(216,184,255,0.4)] transition hover:brightness-110"
          >
            <Bi zh="进入灵犀场" en="Enter the Field" />
          </button>
        </>
      )}
    </div>
  );
}
