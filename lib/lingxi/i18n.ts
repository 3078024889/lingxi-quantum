export const LINGXI_LOCALES = [
  'zh-CN','zh-TW','en','ja','ko','es','pt-BR','fr','de','it','nl','pl','tr','id','vi','th','ar','hi'
] as const;
export type LingxiLocale = typeof LINGXI_LOCALES[number];

export const LOCALE_LABELS: Record<LingxiLocale,string> = {
  'zh-CN':'简体中文','zh-TW':'繁體中文',en:'English',ja:'日本語',ko:'한국어',es:'Español','pt-BR':'Português (Brasil)',fr:'Français',de:'Deutsch',it:'Italiano',nl:'Nederlands',pl:'Polski',tr:'Türkçe',id:'Bahasa Indonesia',vi:'Tiếng Việt',th:'ไทย',ar:'العربية',hi:'हिन्दी'
};

const ZH = {
  brand:'灵犀场', slogan:'一念即达 · 一念显化', hero:'想做什么？直接说。',
  sub:'文件、图片、视频、文档和链接都可以放进来。先看懂问题，再直接给你能用的结果。',
  input:'告诉我你现在卡在哪里……', upload:'上传文件', paste:'粘贴链接', recent:'最近使用', saved:'已收藏',
  free:'免费', paid:'付费', result:'结果', download:'下载', solve:'立即解决', processing:'处理中…',
  uploadFail:'文件上传不了', exactCompress:'压到指定 KB / MB', pdfFix:'PDF 有问题', siteDown:'网站打不开', qrSafe:'二维码安全读取', ocr:'图片取字', privacy:'隐私检查', social:'一图多平台', videoFix:'视频上传修复', videoDub:'视频多语翻译', food:'拍照估热量', portrait:'AI 职业头像'
};
const EN = {
  brand:'LINGXI FIELD', slogan:'One thought. One result.', hero:'What do you want to get done?',
  sub:'Drop in a file, image, video, document or link. We diagnose the problem and return something you can use.',
  input:'Tell me what is blocking you…', upload:'Upload file', paste:'Paste link', recent:'Recent', saved:'Saved',
  free:'Free', paid:'Paid', result:'Result', download:'Download', solve:'Solve now', processing:'Processing…',
  uploadFail:'File won’t upload', exactCompress:'Compress to exact KB / MB', pdfFix:'Fix my PDF', siteDown:'Why is this site down?', qrSafe:'Safe QR reader', ocr:'Image to text', privacy:'Privacy check', social:'One image, every platform', videoFix:'Fix video upload', videoDub:'Translate & dub video', food:'Estimate meal calories', portrait:'AI professional portrait'
};
export type CoreCopy = typeof ZH;
const copies: Partial<Record<LingxiLocale,CoreCopy>> = {'zh-CN':ZH,en:EN};
export function coreCopy(locale:LingxiLocale): CoreCopy { return copies[locale] ?? EN; }
