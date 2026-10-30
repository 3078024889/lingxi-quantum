import Link from 'next/link';
export default function SeoGeoBoard(){
 return <section className="panel seoGeoBoard" aria-label="SEO 与 GEO 可见度榜">
  <div className="rankHead"><h2>SEO / GEO 搜索可见度榜</h2><span>用同一组关键词、地区与日期比较，不用广告排名冒充自然排名</span></div>
  <div className="seoGeoCompare">
   <article><strong>SEO 搜索排名</strong><p>Google / Bing 的关键词自然搜索位置、被收录页面、展示频次和近期变化。</p></article>
   <article><strong>GEO AI 引用</strong><p>AI 回答中是否真实提到或引用产品，按问题、模型、地区及日期测量。</p></article>
   <article><strong>用户实际关心</strong><p>哪些 AI 能免费做视频、图片、音乐或网站；有无水印、商用权与地区限制。</p></article>
   <article><strong>历史趋势</strong><p>从同口径的每日采样计算 7 日、30 日变化；没有历史快照不生成趋势。</p></article>
  </div>
  <p className="seoGeoNote"><strong>当前榜单：</strong>尚无覆盖全体厂商且能公开复核的同口径样本，暂不产生排名和分数。后续只展示带关键词集合、来源、时间与测量方法的有效观测。</p>
  <div className="seoGeoFooter"><Link href="/vendor/claim">厂商免费提交官网及产品资料 ↗</Link><span>品牌推广与自然可见度排名分别计算。</span></div>
 </section>;
}
