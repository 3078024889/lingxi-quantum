"use client";

// Aurora Video Band——按视频原始像素尺寸展示的"取景窗"，不做铺满全屏
// 的拉伸裁切。CSS 里 .lx-video-band 限定了 max-width，视频元素本身
// width:100% / height:auto 顺着容器缩小（屏幕比取景窗窄时等比缩小），
// 但永远不会被放大超过素材本身分辨率——这就是不模糊的关键：模糊从
// 来不是编码参数的问题，是"把小图拉成大图"的问题，这里从根上避免。
//
// 可以在同一个页面、跨多个页面重复使用同一支视频（浏览器会缓存，
// 第二次出现基本零额外流量），不需要每处都换新素材。
//
// 双格式（WebM 优先 + MP4 兜底）保证不同浏览器/系统都能正常播放；
// 静音、循环、内联播放，自动播放失败时 poster 首帧顶上，不会白屏。

const VIDEO_SRC_WEBM = "/images/sky/aurora-hero.webm";
const VIDEO_SRC_MP4 = "/images/sky/aurora-hero.mp4";
const POSTER_SRC = "/images/sky/aurora-hero-poster.jpg";

export default function AuroraVideoBand({ className = "" }: { className?: string }) {
  return (
    <div className={`lx-video-band ${className}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={POSTER_SRC}
        aria-hidden="true"
      >
        <source src={VIDEO_SRC_WEBM} type="video/webm" />
        <source src={VIDEO_SRC_MP4} type="video/mp4" />
      </video>
    </div>
  );
}
