'use client';

import React, { useEffect, useState, use } from 'react';
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function RelationshipFullPage({ searchParams }: { searchParams: Promise<{ id?: string }> | { id?: string } }) {
  const resolvedParams = searchParams instanceof Promise ? use(searchParams) : searchParams;
  const id = resolvedParams?.id;

  const [reportText, setReportText] = useState<string | null>(null);
  // 关键：记住用户选的是哪种关系，用来拼接图片路径！
  const [relFolder, setRelFolder] = useState<string>('romantic'); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "关系共振图谱 | 灵犀 · Relationship Resonance Map | Lingxi";

    async function fetchStaticReport() {
      if (!id) {
        setError('缺少报告 ID。');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/relationship/generate-full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, forceRegenerate: false }),
        });
        const data = await res.json();
        if (data.success && data.report) {
          setReportText(data.report);
          // 拿到后端传来的关系类型（romantic/business/general），用来定位图片文件夹
          if (data.productMeta?.id) {
            setRelFolder(data.productMeta.id);
          }
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

  // 【核心排版引擎】将 ===0X=== 切割成独立的 11 页面数组
  const pages = reportText 
    ? reportText.split(/===\d{2}===/).map(s => s.trim()).filter(Boolean) 
    : [];

  return (
    <>
      <Nav />
      {/* 隐藏网页默认极光背景，把舞台完全交给每一页的专属 PDF 底图 */}
      <main className="pt-24 min-h-screen pb-24 px-2 md:px-8 bg-[#0a1626]">
        
        {loading && (
          <div className="py-32 flex flex-col items-center justify-center text-bone">
            <div className="w-12 h-12 border-2 border-lattice border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="tracking-widest text-lg opacity-80">场域矩阵交织中...</p>
          </div>
        )}

        {error && (
          <div className="py-32 text-center text-rose-300 text-xl tracking-wider">
            {error}
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-12">
            
            <div className="text-center space-y-4 mb-8 print:hidden">
              <h1 className="text-3xl md:text-5xl font-light tracking-widest text-heading">
                关系共振图谱
              </h1>
              <p className="text-base opacity-70 tracking-widest">
                Sovereign Field Relationship Resonance Architecture
              </p>
            </div>

            {/* 循环渲染每一页：一页文字对应一张背景图 */}
            {pages.map((content, idx) => {
              // 完美匹配你截图中的文件夹结构！
              const pageNum = idx + 1; // page-1.png 到 page-11.png
              const bgImageUrl = `/images/relationship-full/${relFolder}/page-${pageNum}.png`; 

              return (
                <div 
                  key={idx} 
                  className="relative w-full aspect-[1/1.414] overflow-hidden rounded-xl shadow-2xl print:shadow-none print:w-full print:h-screen print:rounded-none page-break-after-always"
                >
                  {/* PDF 高清底图层 */}
                  <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('${bgImageUrl}'), linear-gradient(135deg, #1e293b, #0f172a)` }}
                  />
                  
                  {/* 透光玻璃与超大文字层 */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 md:p-16">
                    <div className="lx-report-glass p-8 md:p-12 w-full max-h-[90%] overflow-y-auto custom-scrollbar shadow-2xl">
                      
                      {/* 【字号放大核心区】：使用 text-xl md:text-2xl lg:text-3xl，超大行高 leading-[2.4] */}
                      <div className="prose prose-invert max-w-none text-xl md:text-2xl lg:text-3xl leading-[2.4] tracking-wider text-bone">
                        {content.split('\n').map((para, pIdx) => (
                          para.trim() === '' ? null :
                          // 识别【标题】，使其变色放大并居中
                          (para.startsWith('【') && para.endsWith('】')) ? (
                            <h2 key={pIdx} className="text-2xl md:text-3xl lg:text-4xl text-lattice font-bold mt-8 mb-6 text-center">
                              {para}
                            </h2>
                          ) : (
                            <p key={pIdx} className="mb-6 text-justify">
                              {para}
                            </p>
                          )
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-center pt-12 print:hidden">
              <button 
                onClick={() => window.print()}
                className="lx-portal-btn px-10 py-4 text-lg md:text-xl font-bold tracking-widest cursor-pointer"
              >
                保存 / 打印 11 页绝美图谱 (PDF)
              </button>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
