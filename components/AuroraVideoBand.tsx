"use client";

// Aurora 全站固定背景——不再是页面里某一段"取景窗"，而是真正铺满整个
// 视口、固定不随页面滚动的背景层（position:fixed），这样不管翻到
// 哪个页面、滚到多下面，身后始终是这支真实极光视频在流动，"场是活的"
// 这句话才成立，不是"只有首屏能看到，往下拉就没了"。
//
// 用 object-fit:cover 让视频铺满整个视口——是的，这意味着在超过视频
// 原始分辨率（2560px 宽）的巨屏上会有轻微的放大，但取舍是有意为之：
// 之前那版为了保证"绝对不放大"，把视频缩成一段固定尺寸的小窗，代价是
// 大部分页面区域看不到视频、显得"死"。这版换成了"全站都活，超大屏
// 上略微不是像素级锐利"，这是当前视频素材分辨率下更贴近你要的效果
// 的取舍。视频本身已经是接近真 4K 源剪辑出来的，在主流 1080p～2K
// 屏幕上依然是清晰的。
//
// 双格式（WebM 优先 + MP4 兜底）保证不同浏览器/系统都能正常播放；
// 静音、循环、内联播放，自动播放失败时 poster 首帧顶上，不会白屏。
// 页面所有容器都没有不透明背景色，这支视频作为 body 的固定背景层，
// 会透过全站每一个页面、每一屏显示出来。

const VIDEO_SRC_WEBM = "/images/sky/aurora-hero.webm";
const VIDEO_SRC_MP4 = "/images/sky/aurora-hero.mp4";
const POSTER_SRC = "/images/sky/aurora-hero-poster.jpg";

export default function AuroraVideoBand() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER_SRC}
        className="h-full w-full object-cover"
      >
        <source src={VIDEO_SRC_WEBM} type="video/webm" />
        <source src={VIDEO_SRC_MP4} type="video/mp4" />
      </video>
      {/* 极轻的暗角，压一压视频最亮区域，让全站文字（珍珠白/黄金/极光青）
          在任何画面亮度下都还留有一点余量，不需要再靠光晕这类补丁。 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(8,6,20,0.35)_100%)]" />
    </div>
  );
}
