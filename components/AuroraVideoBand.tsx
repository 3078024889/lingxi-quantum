"use client";

import { useEffect, useState } from "react";

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
  // v270修复：手机百度里打开网站，整个页面变成一支视频。
  // 原因不是代码写错了，是国产 App 内置浏览器（百度、UC、QQ浏览器、
  // 以及微信/QQ用的腾讯X5内核）会主动"接管"页面里的 <video>，把它
  // 提到自己的全屏播放器里播——而这支极光视频恰好是 position:fixed
  // 铺满整个视口的背景层，被接管之后，用户看到的就只剩这支视频，
  // 整个网站的内容全被挡在后面。标准的 playsInline 只管 iOS Safari，
  // 管不了这些自定义内核。
  //
  // 两层处理：
  // 1. 已知会劫持视频的浏览器 —— 直接不渲染 <video>，改用 poster 静态
  //    图当背景。视觉上损失的是"极光在流动"，换来的是页面可用。
  //    这些浏览器里页面能正常打开，比背景会动重要得多。
  // 2. 其余浏览器 —— 补上腾讯X5内核那几个私有属性，明确告诉它
  //    "这个视频用H5内联播，不要全屏、不要加你自己的控件"。
  const [hijacker, setHijacker] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    // baiduboxapp = 手机百度App；后面几个是UC、QQ浏览器、百度自家内核
    setHijacker(/baiduboxapp|UCBrowser|MQQBrowser|QQBrowser|baidubrowser|Quark/i.test(ua));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {hijacker ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={POSTER_SRC} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          className="h-full w-full object-cover"
          // 腾讯X5内核（微信、QQ、部分安卓浏览器）专用：走H5内联播放，
          // 不要接管成全屏播放器。React会把这些带横线的属性原样输出。
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          disablePictureInPicture
          controls={false}
        >
          <source src={VIDEO_SRC_WEBM} type="video/webm" />
          <source src={VIDEO_SRC_MP4} type="video/mp4" />
        </video>
      )}
      {/* 极轻的暗角，压一压视频最亮区域，让全站文字（珍珠白/黄金/极光青）
          在任何画面亮度下都还留有一点余量，不需要再靠光晕这类补丁。 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(8,6,20,0.35)_100%)]" />
      {/* v275：极光之上叠一层深色宇宙罩。
          这是解开一个死结的关键。之前的困境是：面板做透 → 压到极光
          亮带上文字看不清（实测对比度只有 3.2，标准是 4.5）；面板做深
          → 变成暗玻璃，看不出背景在流动，也就没有"空灵"可言。
          两头都想要，唯一的出路是把背景本身的亮度压下来——极光最亮
          那几条光带从约 (180,200,230) 压到约 (95,105,125) 之后，
          面板就可以放心做透，文字也不会被吃掉。
          用两层：一层整体暗色压亮度，一层顶部到底部的渐变，让上方
          （导航与标题所在）更沉，下方保留水面的反光。
          注意：这一层在视频之上、内容之下，不影响视频播放，也不会
          在会劫持视频的浏览器里出问题（那边本来就换成静态图了）。 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,10,26,0.62) 0%, rgba(7,14,32,0.50) 45%, rgba(9,16,38,0.44) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(10,16,36,0.10) 0%, rgba(6,10,26,0.45) 100%)",
        }}
      />
    </div>
  );
}
