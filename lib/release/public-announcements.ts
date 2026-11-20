/** Fallback public announcements; production ticker and archive read the shared database. */
export type PublicNotice={
 id:string;createdAt:string;category:"operations"|"tools"|"mini";
 titleZh:string;titleEn:string;bodyZh:string;bodyEn:string;href:string;
};
export const PUBLIC_RELEASE_NOTICES:readonly PublicNotice[]=Object.freeze([
 {
  id:"web-cn-upgrade-20261108",createdAt:"2026-11-08T16:47:37+08:00",category:"operations",
  titleZh:"灵犀场中国站焕新上线｜11月6—8日升级完成",
  titleEn:"LINGXIFIELD China site refreshed | November 6–8 upgrade",
  bodyZh:"11月6日至8日，灵犀场完成中国站重要升级。全球 SIAI 排行榜、实用工具、SASI 智能软件及公告中心以全新体验呈现。欢迎探索新版灵犀场。",
  bodyEn:"From November 6 to 8, LINGXIFIELD completed a major China-site upgrade. Explore the refreshed SIAI rankings, practical tools, SASI software, and announcement center.",
  href:"/announcements"
 },
 {
  id:"web-tools-collection-20261108",createdAt:"2026-11-08T11:00:00+08:00",category:"tools",
  titleZh:"100+ 实用工具，一站处理日常文件",titleEn:"100+ practical tools in one place",
  bodyZh:"从 PDF、图片到音视频，常用工具集中呈现。工具包提供四档时长选择，后续新增的实用工具也将持续加入。",
  bodyEn:"Discover PDF, image, audio, and video tools in one place. Four ToolPass durations are available to explore, with future practical tools included.",
  href:"/tools/pass"
 },
 {
  id:"web-sasi-software-20261108",createdAt:"2026-11-08T11:05:00+08:00",category:"operations",
  titleZh:"SASI 智能软件专区，发现更多原创作品",titleEn:"Discover original software in SASI",
  bodyZh:"SASI 智能软件与卖家服务专区已开放浏览。软件介绍、授权信息与作品展示将持续丰富，新品上架后会同步公布购买及交付说明。",
  bodyEn:"Browse the SASI software and seller services area. Product details, licenses, and showcases will continue to grow. Purchase and delivery details will accompany official releases.",
  href:"/sasi"
 },
 {
  id:"mini-4.8.2",createdAt:"2026-09-30T14:28:54+08:00",category:"mini",
  titleZh:"灵犀场小程序 4.8.2｜食物识别体验升级",titleEn:"LINGXIFIELD Mini-program 4.8.2 | Food recognition improvements",
  bodyZh:"优化区域食物识别、结果展示与问题反馈，让日常记录更轻松。",
  bodyEn:"Improved regional food recognition, result views, and feedback for easier daily tracking.",
  href:"/announcements"
 }
]);

export function publicNoticeItems(lang:string){
 const zh=lang==="zh";
 return PUBLIC_RELEASE_NOTICES.map(n=>({
  id:"notice:"+n.id,eventKey:"notice:"+n.id,kind:"announcement" as const,
  createdAt:n.createdAt,version:n.id,
  title:zh?n.titleZh:n.titleEn,body:zh?n.bodyZh:n.bodyEn,
  href:n.href,read:undefined as boolean|undefined
 }));
}
