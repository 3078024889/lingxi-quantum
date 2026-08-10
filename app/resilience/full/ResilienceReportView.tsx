"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";
import Bi from "@/components/Bi";
import ShareButton from "@/components/ShareButton";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const SECTION_TITLES = [
  { titleZh: "◆ 你的五项结构", titleEn: "◆ Your Five Dimensions" },
  { titleZh: "① 生命韧性源点", titleEn: "① Where Your Resilience Begins" },
  { titleZh: "② 压力恢复能力", titleEn: "② Stress Recovery" },
  { titleZh: "③ 变化适应能力", titleEn: "③ Adaptability to Change" },
  { titleZh: "④ 危机反弹能力", titleEn: "④ Crisis Rebound" },
  { titleZh: "⑤ 长期坚持能力", titleEn: "⑤ Long-Term Persistence" },
  { titleZh: "⑥ 精神稳定结构", titleEn: "⑥ Emotional Stability Structure" },
  { titleZh: "⑦ 隐藏恢复模式", titleEn: "⑦ Hidden Recovery Pattern" },
  { titleZh: "⑧ 能量消耗地图", titleEn: "⑧ Energy Drain Map" },
  { titleZh: "⑨ 韧性进化路径", titleEn: "⑨ Resilience Growth Path" },
  { titleZh: "⑩ 灵犀场恢复实践", titleEn: "⑩ A Personal Recovery Practice" },
  { titleZh: "⑪ 生命韧性总结", titleEn: "⑪ Resilience Summary" },
];

export default function ResilienceReportView({ id }: { id: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  
  const [status, setStatus] = useState<"checking" | "locked" | "ready" | "error">("checking");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [showWechatPay, setShowWechatPay] = useState(false);

  useEffect(() => {
    document.title = "生命韧性档案 | 灵犀 · Resilience Archive | Lingxi";

    const load = async () => {
      const supabase = createClient();
      const { data: submission } = await supabase
        .from("resilience_submissions")
        .select("name")
        .eq("id", id)
        .single();
        
      if (submission) setName(submission.name || "");

      const currentLangEn = document.documentElement.classList.contains("lang-en");
      try {
        const res = await fetch("/api/resilience/generate-full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, forceRegenerate: false, lang: currentLangEn ? "en" : "zh" }),
        });
        
        if (res.status === 402) {
          setStatus("locked");
          return;
        }
        
        const data = await res.json();
        if (!res.ok || (!data.fullReport && !data.report)) {
          setStatus("error");
          setError(data.error || t("生成失败，请稍后再试。", "Generation failed — please try again."));
          return;
        }
        
        // 兼容全新的 ===0X=== 分隔符体系
        const reportText = data.report || data.fullReport;
        const parts = reportText
          .split(/===\s*\d+\s*===/)
          .map((s: string) => s.trim())
          .filter(Boolean);
          
        setSections(parts);
        setStatus("ready");
      } catch (e) {
        console.error("[report view] 请求失败:", e);
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
      }
    };
    load();
  }, [id]);

  const unlock = () => {
    if (REVIEW_MODE) {
      setStatus("checking");
      window.location.reload();
      return;
    }
    setShowWechatPay(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="lx-checking-glow mx-auto h-14 w-14 rounded-full" />
        <p className="mt-8 font-display text-lg text-bone">
          {t("场域正在展开你的完整生命韧性档案...", "The field is unfolding your full Resilience Archive...")}
        </p>
        <p className="mt-2 text-sm text-bone/70">
          {t("第一次生成需要一点时间，请不要关闭页面。", "The first generation takes a little while, please do not close this page.")}
        </p>
        <style>{`
          .lx-checking-glow { background: radial-gradient(circle, rgba(126,232,196,0.5), transparent 70%); filter: blur(14px); animation: lx-checking-breathe 2.2s ease-in-out infinite; }
          @keyframes lx-checking-breathe { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 0.9; transform: scale(1.1); } }
          @media (prefers-reduced-motion: reduce) { .lx-checking-glow { animation: none !important; } }
        `}</style>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-3xl text-bone">🔒 <Bi zh="尚未解锁档案" en="Not yet unlocked" /></p>
        <button
          onClick={unlock}
          className="mt-10 lx-portal-btn px-8 py-4 font-display text-base uppercase tracking-widest2 transition"
        >
          <Bi zh={`解锁完整档案 · ¥${getProduct("resilience-report")?.priceRmb}`} en={`Unlock Full Archive · ¥${getProduct("resilience-report")?.priceRmb}`} />
        </button>
        {error && <p className="mt-4 text-xs text-rose-400">{error}</p>}
        {showWechatPay && (
          <WechatPayModal
            productId="resilience-report"
            submissionId={id}
            priceRmb={getProduct("resilience-report")?.priceRmb ?? 0}
            productName={{ zh: "生命韧性指数 · 完整档案", en: "Life Resilience Index · Full Archive" }}
            onClose={() => setShowWechatPay(false)}
            onSuccess={() => window.location.reload()}
          />
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center text-xl text-rose-300 tracking-wider">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-24 min-h-screen pb-24 px-2 md:px-8 bg-[#0a1626]">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* 顶部标题区 */}
          <div className="text-center space-y-4 mb-8 print:hidden">
            <h1 className="text-3xl md:text-5xl font-light tracking-widest text-heading">
              生命韧性档案
            </h1>
            <p className="text-base opacity-70 tracking-widest">
              Lingxi Field · Life Resilience Archive
            </p>
          </div>

          {/* ========================================================
              第 1 页：封面 (Background: page-0.png)
              ======================================================== */}
          <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
            <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                 style={{ backgroundImage: `url('/images/resilience-full/page-0.png'), linear-gradient(135deg, #1e293b, #0f172a)` }} />
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-16">
              <div className="lx-report-glass p-8 md:p-12 w-full max-h-[90%] shadow-2xl flex flex-col justify-center items-center h-1/2">
                <h1 className="font-display text-4xl md:text-6xl font-light tracking-[0.08em] text-[#3A2E52] text-center" style={{ textShadow: "0 2px 20px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.9)" }}>
                  {name || t("你的", "Your")} <Bi zh="生命韧性档案" en="Resilience Archive" />
                </h1>
                <p className="mt-6 text-lg md:text-xl text-[#3A2E52]/80 tracking-widest">
                  Life Resilience Index
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              第 2-12 页：正文章节 (Background: page-1.png 到 page-11.png)
              ======================================================== */}
          {sections.map((content, i) => {
            // 素材有 page-1 到 page-11，确保不越界
            const bgNum = Math.min(i + 1, 11);
            const bgImageUrl = `/images/resilience-full/page-${bgNum}.png`;
            const title = SECTION_TITLES[i] ?? { titleZh: `第${i + 1}段`, titleEn: `Section ${i + 1}` };

            return (
              <div key={i} className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always">
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('${bgImageUrl}'), linear-gradient(135deg, #1e293b, #0f172a)` }}
                />
                
                <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-16">
                  <div className="lx-report-glass p-8 md:p-12 w-full max-h-[95%] overflow-y-auto custom-scrollbar shadow-2xl">
                    
                    {/* 章节标题 */}
                    <div className="text-center mb-8 border-b border-[#3A2E52]/10 pb-6">
                      <p className="font-display text-[11px] md:text-sm uppercase tracking-[0.34em] text-[#8C7FA8] mb-2">
                        LIFE RESILIENCE · {String(i + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                      </p>
                      <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.08em] text-[#3A2E52]">
                        <Bi zh={title.titleZh} en={title.titleEn} />
                      </h3>
                    </div>

                    {/* 【字号放大核心区】：text-xl md:text-2xl lg:text-3xl */}
                    <div className="prose prose-invert max-w-none text-xl md:text-2xl lg:text-3xl leading-[2.4] tracking-wider text-[#2E2742]">
                      {content.split('\n').map((para, pIdx) => {
                        const trimmedPara = para.trim();
                        if (!trimmedPara) return null;
                        
                        // 识别【标题】，加粗并变色
                        if (trimmedPara.startsWith('【') && trimmedPara.endsWith('】')) {
                          return (
                            <h2 key={pIdx} className="text-2xl md:text-3xl lg:text-4xl text-[#6D4A9C] font-bold mt-8 mb-6 text-center">
                              {trimmedPara}
                            </h2>
                          );
                        }
                        
                        return (
                          <p key={pIdx} className="mb-6 text-justify indent-8">
                            {trimmedPara}
                          </p>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {/* 底部功能区 */}
          <div className="text-center space-y-8 pt-12 print:hidden">
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={handlePrint}
                className="lx-portal-btn px-10 py-4 text-lg md:text-xl font-bold tracking-widest cursor-pointer"
              >
                <Bi zh="保存 / 打印完整档案 (PDF)" en="Save / Print Full Archive (PDF)" />
              </button>
              <ShareButton
                text={t("我做了一份灵犀生命韧性档案，去看看你自己的：", "I got my Lingxi Life Resilience Archive — check out your own:")}
                url="https://lingxifield.com/resilience"
                label={{ zh: "分享这份报告", en: "Share this reading" }}
              />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
