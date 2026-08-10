'use client';

import React, { useEffect, useState, use } from 'react';
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "关系共振图谱 | 灵犀 · Relationship Resonance Map | Lingxi" };

export default function RelationshipFullPage({ searchParams }: { searchParams: Promise<{ id?: string }> | { id?: string } }) {
  // 适配 Next.js 13/14/15 的 searchParams 异步解析
  const resolvedParams = searchParams instanceof Promise ? use(searchParams) : searchParams;
  const id = resolvedParams?.id;

  const [reportText, setReportText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStaticReport() {
      if (!id) {
        setError('缺少报告 ID。');
        setLoading(false);
        return;
      }

      try {
        // 直接请求我们刚刚重构好的 0-Token 静态后端接口
        const res = await fetch('/api/relationship/generate-full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, forceRegenerate: false }),
        });

        const data = await res.json();
        if (data.success && data.report) {
          setReportText(data.report);
        } else {
          setError(data.error || '场域共振数据加载失败。');
        }
      } catch (err: any) {
        console.error(err);
        setError('网络连接异常，请检查场域信号。');
      } finally {
        setLoading(false);
      }
    }

    fetchStaticReport();
  }, [id]);

  return (
    <>
      <Nav />
      <main className="pt-24 min-h-screen pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 顶部标题 */}
          <div className="text-center space-y-2 pt-6">
            <h1 className="text-3xl md:text-4xl font-light tracking-widest text-heading">
              关系共振图谱
            </h1>
            <p className="text-sm opacity-70 tracking-wider">
              Sovereign Field Relationship Resonance Architecture
            </p>
          </div>

          {/* 核心报告展示区：应用了我们完美的 6px 浅色透光玻璃面板 */}
          <div className="lx-report-glass p-6 md:p-12 space-y-6 shadow-2xl">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-bone">
                <div className="w-10 h-10 border-2 border-lattice border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="tracking-widest text-sm opacity-80">灵犀场域正在交织你们的共振矩阵...</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center text-rose-300">
                <p className="tracking-wider">{error}</p>
              </div>
            ) : reportText ? (
              <div className="space-y-6 whitespace-pre-wrap leading-relaxed text-base">
                {reportText}
              </div>
            ) : (
              <div className="py-16 text-center opacity-70">
                <p>暂未检测到有效的共振档案正文。</p>
              </div>
            )}
          </div>

          {/* 底部打印/下载按钮 */}
          {!loading && !error && (
            <div className="flex justify-center gap-4 pt-4">
              <button 
                onClick={() => window.print()}
                className="lx-portal-btn px-8 py-3 text-sm tracking-widest cursor-pointer"
              >
                保存 / 打印完整档案 (PDF)
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
