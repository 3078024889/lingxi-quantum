import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const OUT = path.join(WORK, "extracts", "site-rest");
const RAW = path.join(__dirname, "_raw-html");
const PDFDIR = path.join(__dirname, "_raw-pdf");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PDFDIR, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Priority already READ (skip these source pages). Include twins on wingmakerschina.
const SKIP_URL_SUBSTR = [
  // wingmakers.com.cn works already in priority
  "works.html?id=4", // six virtues thin but priority
  "works.html?id=6", // energetic heart
  "works.html?id=7", // event temples
  "works.html?id=8", // living truth
  "works.html?id=10", // ascending heart
  "works.html?id=11", // living from heart
  "works.html?id=12", // lyricus 6
  "works.html?id=13",
  "works.html?id=14",
  "works.html?id=15",
  "works.html?id=16",
  "works.html?id=17", // lyricus 1
  "works.html?id=27", // blueprint
  "works.html?id=28", // modes
  "works.html?id=29", // life principles
  "works.html?id=33", // neruda 1-5
  "works.html?id=34",
  "works.html?id=35",
  "works.html?id=36",
  "works.html?id=37",
  "works.html?id=46", // quantum pause
  "about.html?id=15", // ancient arrow thin
  "about.html?id=17", // mahu interview index
  "about.html?id=18", // conscious media
  "about.html?id=19", // camelot
  "about.html?id=22", // mahu 2008
  "about.html?id=23",
  "about.html?id=24",
  "about.html?id=26", // mahu 2013
  // wingmakerschina duplicates of priority
  "/camelot/",
  "/cminterv/",
  "/discourse1/",
  "/discourse2/",
  "/discourse3/",
  "/discourse4/",
  "/discourse5/",
  "/discourse6/",
  "/neruda1/",
  "/neruda2/",
  "/neruda3/",
  "/neruda4/",
  "/neruda5/",
  "/philosophy1/",
  "/philosophy2/",
  "/philosophy3/",
  "/eheart/",
  "/livingheart/",
  "/livingtruth/",
  "/risingheart/",
  "/sactivism/",
  "/quantumpause/",
  "/lymission/", // lyricus intro / liminal - may overlap lyricus_intro; still fetch if not exact
];

// Prefer fetching unique remaining content (not crawler chrome / feeds / art galleries)
const QUEUE = [
  // === wingmakers.com.cn remaining text pages (already have some raw) ===
  { url: "https://www.wingmakers.com.cn/works.html?id=1", title: "哲学索引", id: "wm_cn_philosophy_index" },
  { url: "https://www.wingmakers.com.cn/works.html?id=2", title: "灵性之旅的工具", id: "wm_cn_spiritual_tools" },
  { url: "https://www.wingmakers.com.cn/works.html?id=3", title: "理瑞克斯索引", id: "wm_cn_lyricus_index" },
  { url: "https://www.wingmakers.com.cn/works.html?id=5", title: "真诚的艺术", id: "wm_cn_art_of_authenticity" },
  { url: "https://www.wingmakers.com.cn/works.html?id=9", title: "何时-哪个-如何训练序言", id: "wm_cn_wwh_preface" },
  { url: "https://www.wingmakers.com.cn/works.html?id=18", title: "阈限宇宙起源论", id: "wm_cn_liminal_cosmogony" },
  { url: "https://www.wingmakers.com.cn/works.html?id=24", title: "词汇表", id: "wm_cn_glossary" },
  { url: "https://www.wingmakers.com.cn/works.html?id=25", title: "未发布哲学文本摘录", id: "wm_cn_unpublished_philosophy" },
  { url: "https://www.wingmakers.com.cn/works.html?id=26", title: "信念及其能量系统", id: "wm_cn_belief_energy" },
  { url: "https://www.wingmakers.com.cn/works.html?id=31", title: "神话叙事", id: "wm_cn_myth_narrative" },
  { url: "https://www.wingmakers.com.cn/works.html?id=32", title: "聂鲁达访谈索引", id: "wm_cn_neruda_index" },
  { url: "https://www.wingmakers.com.cn/works.html?id=38", title: "主权积分态宣言", id: "wm_cn_si_manifesto" },
  { url: "https://www.wingmakers.com.cn/works.html?id=39", title: "意识物理学", id: "wm_cn_physics_consciousness" },
  { url: "https://www.wingmakers.com.cn/works.html?id=40", title: "曼图斯迪亚的愿景", id: "wm_cn_mantustia" },
  { url: "https://www.wingmakers.com.cn/works.html?id=41", title: "第一源头传递", id: "wm_cn_first_source_transmission" },
  { url: "https://www.wingmakers.com.cn/works.html?id=42", title: "诗歌索引", id: "wm_cn_poetry_index" },
  { url: "https://www.wingmakers.com.cn/works.html?id=45", title: "实践者", id: "wm_cn_practitioner" },
  { url: "https://www.wingmakers.com.cn/works.html?id=47", title: "造翼者工具", id: "wm_cn_wm_tools" },
  { url: "https://www.wingmakers.com.cn/works.html?id=50", title: "理瑞克斯常见问答", id: "wm_cn_lyricus_faq" },
  { url: "https://www.wingmakers.com.cn/works.html?id=54", title: "信念及其能量系统-54", id: "wm_cn_belief_energy_54" },
  { url: "https://www.wingmakers.com.cn/works_poetry.html?id=43", title: "诗歌-古箭", id: "wm_cn_poetry_ancient_arrow" },
  { url: "https://www.wingmakers.com.cn/works_poetry.html?id=44", title: "诗歌-哈科密", id: "wm_cn_poetry_hakomi" },
  { url: "https://www.wingmakers.com.cn/bloginfo/2.html", title: "什么是灵性生活", id: "wm_cn_spiritual_life" },
  { url: "https://www.wingmakers.com.cn/questions.html", title: "常见问答", id: "wm_cn_questions" },
  { url: "https://www.wingmakers.com.cn/about.html?id=1", title: "序言", id: "wm_cn_preface" },
  { url: "https://www.wingmakers.com.cn/about.html?id=12", title: "詹姆斯.玛呼", id: "wm_cn_james_mahu" },
  { url: "https://www.wingmakers.com.cn/about.html?id=13", title: "历史", id: "wm_cn_history" },
  { url: "https://www.wingmakers.com.cn/about.html?id=14", title: "图解", id: "wm_cn_diagram" },
  { url: "https://www.wingmakers.com.cn/aboutus.html", title: "关于本站/玛呼小传", id: "wm_cn_aboutus" },
  { url: "https://www.wingmakers.com.cn/literature.html", title: "文学", id: "wm_cn_literature" },
  { url: "https://www.wingmakers.com.cn/download.html", title: "下载页", id: "wm_cn_download" },

  // === wingmakerschina unique remaining (skip priority twins) ===
  { url: "https://www.wingmakerschina.com/2014/10/14/newjourney/", title: "进化杂志访谈", id: "wmc_evolver" },
  { url: "https://www.wingmakerschina.com/2017/10/21/history/", title: "历史", id: "wmc_history" },
  { url: "https://www.wingmakerschina.com/2017/10/23/preface/", title: "序言", id: "wmc_preface" },
  { url: "https://www.wingmakerschina.com/2017/12/08/diagram/", title: "图表", id: "wmc_diagram" },
  { url: "https://www.wingmakerschina.com/2017/12/08/lyquestions/", title: "理瑞克斯问答", id: "wmc_lyricus_q" },
  { url: "https://www.wingmakerschina.com/2017/12/08/mantustia/", title: "曼塔斯蒂尔的愿景", id: "wmc_mantustia" },
  { url: "https://www.wingmakerschina.com/2017/12/08/pexcerpts/", title: "未发布哲学摘录", id: "wmc_pexcerpts" },
  { url: "https://www.wingmakerschina.com/2017/12/08/philosophyterm/", title: "词汇表", id: "wmc_glossary" },
  { url: "https://www.wingmakerschina.com/2017/12/08/questions/", title: "读者问答", id: "wmc_questions" },
  { url: "https://www.wingmakerschina.com/2017/12/08/simanifesto/", title: "主权整体宣言", id: "wmc_si_manifesto" },
  { url: "https://www.wingmakerschina.com/2017/12/08/transmission/", title: "最初源头传输", id: "wmc_transmission" },
  { url: "https://www.wingmakerschina.com/2017/12/09/aotic/", title: "个体意识之解剖", id: "wmc_aotic" },
  { url: "https://www.wingmakerschina.com/2017/12/09/cotec/", title: "意识进化的一致性", id: "wmc_cotec" },
  { url: "https://www.wingmakerschina.com/2017/12/09/dohrman/", title: "神谕石", id: "wmc_dohrman" },
  { url: "https://www.wingmakerschina.com/2017/12/09/philosophy4/", title: "哲学第四室-信念及其能量系统", id: "wmc_philosophy4" },
  { url: "https://www.wingmakerschina.com/2017/12/09/quantusum/", title: "量子集合", id: "wmc_quantusum" },
  { url: "https://www.wingmakerschina.com/2017/12/09/weathercomposer/", title: "天气作曲家", id: "wmc_weather" },
  { url: "https://www.wingmakerschina.com/2017/12/10/behavior/", title: "行为智慧", id: "wmc_behavior" },
  { url: "https://www.wingmakerschina.com/2017/12/10/genuinheart/", title: "真实的艺术", id: "wmc_genuine" },
  { url: "https://www.wingmakerschina.com/2017/12/10/imagination/", title: "想象力：意识的望远镜", id: "wmc_imagination" },
  { url: "https://www.wingmakerschina.com/2017/12/10/knowthyself/", title: "认识你自己", id: "wmc_knowthyself" },
  { url: "https://www.wingmakerschina.com/2017/12/10/tooaak/", title: "提升和业力的起源", id: "wmc_tooaak" },
  { url: "https://www.wingmakerschina.com/2017/12/10/wwh/", title: "何时哪个如何实践指南", id: "wmc_wwh" },
  { url: "https://www.wingmakerschina.com/2020/04/03/spirituallife/", title: "什么是灵性生活", id: "wmc_spiritual_life" },
  { url: "https://www.wingmakerschina.com/2020/07/29/practitioner/", title: "实践者", id: "wmc_practitioner" },
  { url: "https://www.wingmakerschina.com/2020/08/15/jamesmahu/", title: "詹姆斯·马胡", id: "wmc_jamesmahu" },
  { url: "https://www.wingmakerschina.com/2020/08/15/mythnarrative/", title: "神话叙述", id: "wmc_myth" },
  { url: "https://www.wingmakerschina.com/2020/08/16/physicsconscious/", title: "意识物理学", id: "wmc_physics" },
  { url: "https://www.wingmakerschina.com/2020/08/16/spiritualtools/", title: "灵性之旅的工具", id: "wmc_tools" },
  { url: "https://www.wingmakerschina.com/2022/02/16/sicn/", title: "主权整体一种新的存在模式", id: "wmc_sicn" },
  { url: "https://www.wingmakerschina.com/2022/02/21/aboutwm/", title: "关于造翼者", id: "wmc_aboutwm" },
  { url: "https://www.wingmakerschina.com/2022/04/30/philosophyintro/", title: "哲学介绍", id: "wmc_phil_intro" },
  { url: "https://www.wingmakerschina.com/2022/07/10/wmtools/", title: "造翼者工具", id: "wmc_wmtools" },
  { url: "https://www.wingmakerschina.com/2022/07/11/wmintro/", title: "WingMakers简介", id: "wmc_wmintro" },
  { url: "https://www.wingmakerschina.com/2022/07/13/lyricus/", title: "理律克斯", id: "wmc_lyricus" },
  { url: "https://www.wingmakerschina.com/2023/04/13/mocihome/", title: "魔溪生活首页", id: "wmc_mocihome" },
  { url: "https://www.wingmakerschina.com/2023/04/15/moci-%e5%88%9b%e5%a7%8b%e8%a7%86%e8%a7%92/", title: "魔溪-创始理念", id: "wmc_moci_vision" },
  { url: "https://www.wingmakerschina.com/2023/04/15/moci-nonvision/", title: "魔溪的非愿景性", id: "wmc_moci_nonvision" },
  { url: "https://www.wingmakerschina.com/2023/08/05/storybehind/", title: "故事背后的故事", id: "wmc_storybehind" },
  { url: "https://www.wingmakerschina.com/2023/08/14/mono/", title: "走进神秘展览综述", id: "wmc_mono" },
  { url: "https://www.wingmakerschina.com/2023/09/22/%e4%ba%8b%e4%bb%b6%e5%bc%a6%ef%bc%8c%e5%bc%a6%e7%90%86%e8%ae%ba%e5%92%8c%e4%b8%87%e7%89%a9%e7%90%86%e8%ae%ba/", title: "事件弦弦理论万物理论", id: "wmc_event_string" },
  { url: "https://www.wingmakerschina.com/2023/09/22/%e9%80%a0%e7%bf%bc%e8%80%85%e6%96%87%e5%ad%a6%ef%bc%9a%e6%bf%80%e6%b4%bb%e5%85%a5%e5%8f%a3%ef%bc%8c%e5%8f%ac%e9%9b%86%e4%ba%8c%e5%8d%81%e4%b8%80%e4%b8%96%e7%ba%aa%e6%98%be%e5%9c%a3%e8%80%85%e4%bf%a1/", title: "造翼者文学激活入口", id: "wmc_wm_lit" },
  { url: "https://www.wingmakerschina.com/2023/09/22/wmpublish/", title: "造翼者与出版", id: "wmc_publish" },
  { url: "https://www.wingmakerschina.com/2023/11/01/losthistory1/", title: "哥白尼核心指令与遗失的历史", id: "wmc_losthistory1" },
  { url: "https://www.wingmakerschina.com/2023/11/22/mythage/", title: "遗失的历史白色灾星", id: "wmc_mythage" },
  { url: "https://www.wingmakerschina.com/2021/08/08/%e5%bf%83%e4%b9%8b%e5%85%ad%e7%be%8e%e5%be%b7%e7%9b%ae%e5%bd%95/", title: "心之六美德目录", id: "wmc_sixvirtues_toc" },

  // === mocilife category intros / founder materials (HTML) ===
  { url: "https://www.mocilife.cn/index.php?c=category&id=1", title: "MOCI介绍", id: "moci_cat_1" },
  { url: "https://www.mocilife.cn/index.php?c=category&id=2", title: "MOCI创始材料", id: "moci_cat_2" },
  { url: "https://www.mocilife.cn/index.php?c=category&id=3", title: "AIRE平台", id: "moci_cat_3" },
  { url: "https://www.mocilife.cn/index.php?c=show&id=3", title: "联合创始人", id: "moci_show_3" },

  // === sovereignintegral category pages ===
  { url: "https://www.sovereignintegral.cn/index.php?c=category&id=1", title: "SI介绍", id: "si_cat_1" },
  { url: "https://www.sovereignintegral.cn/index.php?c=category&id=2", title: "SI在线阅读", id: "si_cat_2" },
  { url: "https://www.sovereignintegral.cn/index.php?c=category&id=16", title: "SI作者传", id: "si_cat_16" },

  // === jamesmahu.com.cn categories ===
  { url: "https://www.jamesmahu.com.cn/index.php?c=category&id=1", title: "玛呼介绍", id: "jm_cat_1" },
  { url: "https://www.jamesmahu.com.cn/index.php?c=category&id=4", title: "玛呼文章", id: "jm_cat_4" },

  // === PDFs (substantial site bodies) ===
  { url: "http://www.sovereignintegral.cn/uploadfile/202303/c2d4dba1937452d.pdf", title: "主权性积分态论文-ZSIGP", id: "si_pdf_zsigp", kind: "pdf" },
  { url: "http://www.sovereignintegral.cn/uploadfile/202408/ba2331d5cfd6324.pdf", title: "主权性积分态论文-主权玫瑰", id: "si_pdf_rose", kind: "pdf" },
  { url: "http://www.sovereignintegral.cn/uploadfile/202402/281584657aba28c.pdf", title: "主权性积分态-原文+3译文对照", id: "si_pdf_parallel", kind: "pdf" },
  { url: "http://www.sovereignintegral.cn/0552/pdf/40.pdf", title: "主权性积分态-赞雅译", id: "si_pdf_zyanya", kind: "pdf" },
  { url: "http://www.sovereignintegral.cn/0552/pdf/41.pdf", title: "主权性积分态-Psiage", id: "si_pdf_psiage", kind: "pdf" },
  { url: "https://www.jamesmahu.com.cn/uploadfile/202303/1cf5e821d460c7a.pdf", title: "jamesmahu-cn-pdf", id: "jm_pdf_1", kind: "pdf" },
  // mocilife key PDFs (not every duplicate translation — pick main editions)
  { url: "https://www.mocilife.cn/uploadfile/202408/0308adc90d4a613.pdf", title: "MOCI材料-ZSIGP-V1.44", id: "moci_pdf_zsigp_144", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202308/a9c56c549ad0c66.pdf", title: "MOCI材料-ZSIGP-V1.4", id: "moci_pdf_zsigp_14", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202405/68560d327bb66b7.pdf", title: "MOCI材料-主权玫瑰V2", id: "moci_pdf_rose_v2", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202309/61f522633f7f7d1.pdf", title: "走进神秘", id: "moci_pdf_into_mystery", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202308/146b5159a48cc21.pdf", title: "MOCI-PDF-146b", id: "moci_pdf_146b", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202308/5ad4632132b659a.pdf", title: "MOCI-PDF-5ad4", id: "moci_pdf_5ad4", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202308/5f8ec8d64fbe93f.pdf", title: "MOCI-PDF-5f8e", id: "moci_pdf_5f8e", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202308/67a46fd05a3390c.pdf", title: "MOCI-PDF-67a4", id: "moci_pdf_67a4", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202308/8733cddcf2ad6ad.pdf", title: "MOCI-PDF-8733", id: "moci_pdf_8733", kind: "pdf" },
  { url: "https://www.mocilife.cn/uploadfile/202402/80e9ddef5293553.pdf", title: "MOCI-Psiage-80e9", id: "moci_pdf_psi_80e9", kind: "pdf" },
];

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 7) return reject(new Error("too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 60000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        return resolve(fetchBuf(next, redirects + 1));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () =>
        resolve({ status: res.statusCode, url, body: Buffer.concat(chunks), ctype: res.headers["content-type"] || "" })
      );
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

function stripHtml(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<(header|aside|menu)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  // wingmakers.com.cn often puts body in #content / .content / .article
  const main =
    s.match(/<div[^>]*(?:id|class)=["'][^"']*(?:content|article|entry|post|main)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    s.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (main && main[1] && main[1].length > 500) s = main[1];
  s = s.replace(/<[^>]+>/g, "\n");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/&#x[0-9a-f]+;/gi, " ");
  const lines = s
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const LEGAL =
    /copyright|©|all rights reserved|版权所有|著作权|出版社|ICP备|备案号|知识共享|BY-NC|privacy policy|terms of use|cookie|Powered by|WordPress|Elementor|Theme:|Designed by/i;
  const NAVISH =
    /^(首页|Home|Select Page|菜单|Menu|搜索|Search|上一页|下一页|返回|Back|登录|Login|阅读更多|read more|了解更多)$/i;
  // Drop repeated chrome nav items that leak from WM CN template
  const CHROME =
    /^(介绍|古箭计划遗址|图\s*解|历\s*史|玛呼访谈|詹姆斯\.玛呼|社交媒体|翻译|常见问答|下载及电台|哲学|文本|理瑞克斯|心脏六美德|文学|诗歌|实践者|博客|其他官网|联系方式|关于本站)$/;
  const kept = lines.filter((l) => !LEGAL.test(l) && !NAVISH.test(l) && !(CHROME.test(l) && l.length < 20) && l.length > 1);
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractTitle(html, fallback) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (m) {
    let t = m[1].replace(/\s+/g, " ").trim();
    t = t.replace(/^造翼者中文网站-/, "").replace(/\s*[|\-–].*$/, "").trim();
    if (t && t.length > 1) return t;
  }
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const t = h1[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (t) return t;
  }
  return fallback;
}

function shouldSkip(url) {
  const u = url.toLowerCase();
  for (const s of SKIP_URL_SUBSTR) {
    if (u.includes(s.toLowerCase())) return s;
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const rawMap = new Map();
for (const f of fs.readdirSync(RAW)) {
  if (!f.endsWith(".html")) continue;
  rawMap.set(f, path.join(RAW, f));
}

function findRawForUrl(url) {
  const safe = url
    .replace(/^https?:\/\//, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_");
  // try exact-ish
  for (const [f, p] of rawMap) {
    const key = f.replace(/\.html$/, "");
    if (safe.startsWith(key) || key.startsWith(safe.slice(0, 60))) {
      // prefer longer match containing works_id
      if (url.includes("works.html?id=")) {
        const id = url.match(/id=(\d+)/)?.[1];
        if (id && f.includes(`works.html_id_${id}`)) return p;
      }
      if (url.includes("about.html?id=")) {
        const id = url.match(/id=(\d+)/)?.[1];
        if (id && f.includes(`about.html_id_${id}`)) return p;
      }
      if (url.includes("bloginfo/2") && f.includes("bloginfo_2")) return p;
      if (url.includes("questions.html") && f.includes("questions.html")) return p;
      if (url.includes("download.html") && f.includes("download.html")) return p;
      if (url.includes("aboutus.html") && f.includes("aboutus")) return p;
    }
  }
  // secondary: encode id pattern
  const m = url.match(/works\.html\?id=(\d+)/);
  if (m) {
    const hit = [...rawMap.keys()].find((f) => f.includes(`works.html_id_${m[1]}`));
    if (hit) return rawMap.get(hit);
  }
  const a = url.match(/about\.html\?id=(\d+)/);
  if (a) {
    const hit = [...rawMap.keys()].find((f) => f.includes(`about.html_id_${a[1]}`));
    if (hit) return rawMap.get(hit);
  }
  return null;
}

const results = [];
let i = 0;
for (const item of QUEUE) {
  i++;
  const skip = shouldSkip(item.url);
  if (skip) {
    results.push({ ...item, status: "SKIP_PRIORITY", skipReason: skip, chars: 0 });
    console.log(`[${i}/${QUEUE.length}] SKIP`, item.id, skip);
    continue;
  }
  const rec = {
    id: item.id,
    title: item.title,
    url: item.url,
    kind: item.kind || "html",
    status: "MISS",
    chars: 0,
  };
  try {
    let text = "";
    let pageTitle = item.title;
    if (item.kind === "pdf") {
      const pdfPath = path.join(PDFDIR, item.id + ".pdf");
      let buf;
      if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 1000) {
        buf = fs.readFileSync(pdfPath);
      } else {
        const r = await fetchBuf(item.url);
        if (r.status >= 400) throw new Error("http_" + r.status);
        buf = r.body;
        fs.writeFileSync(pdfPath, buf);
      }
      const parsed = await pdfParse(buf);
      text = (parsed.text || "")
        .split(/\n+/)
        .map((l) => l.replace(/\s+/g, " ").trim())
        .filter((l) => l && !/copyright|©|版权所有|ICP|备案/i.test(l))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      pageTitle = item.title;
      rec.via = "pdf-parse";
    } else {
      let html = null;
      const rawPath = findRawForUrl(item.url);
      if (rawPath) {
        html = fs.readFileSync(rawPath, "utf8");
        rec.via = "raw-cache:" + path.basename(rawPath);
      } else {
        const r = await fetchBuf(item.url);
        if (r.status >= 400) throw new Error("http_" + r.status);
        html = r.body.toString("utf8");
        // save raw
        const safe = item.url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").slice(0, 120);
        fs.writeFileSync(path.join(RAW, safe + ".html"), html, "utf8");
        rec.via = "fetch";
        await sleep(250);
      }
      pageTitle = extractTitle(html, item.title);
      text = stripHtml(html);
    }

    // drop header metadata lines we add? keep body only
    const bodyChars = text.length;
    rec.chars = bodyChars;
    rec.pageTitle = pageTitle;
    if (bodyChars >= 2000) rec.status = "READ";
    else if (bodyChars >= 400) rec.status = "THIN";
    else rec.status = "THIN/MISS";

    const header = [
      `TITLE: ${pageTitle}`,
      `SOURCE: ${item.url}`,
      `CHARS: ${bodyChars}`,
      `STATUS: ${rec.status}`,
      "",
      text,
    ].join("\n");
    const outFile = path.join(OUT, item.id + ".txt");
    fs.writeFileSync(outFile, header, "utf8");
    rec.file = "extracts/site-rest/" + item.id + ".txt";
    console.log(`[${i}/${QUEUE.length}] ${rec.status} ${bodyChars} ${item.id} (${pageTitle})`);
  } catch (e) {
    rec.status = "MISS";
    rec.error = String(e.message || e);
    console.log(`[${i}/${QUEUE.length}] MISS ${item.id} ${rec.error}`);
  }
  results.push(rec);
}

// Yale hunt honesty
const yale = {
  target: "耶鲁大访谈 / Yale Interview",
  status: "MISS",
  notes:
    "Not present in wingmakers.com.cn nav, download.html, works/about IDs, wingmakerschina interview list, mocilife/sovereign/jamesmahu.cn link labels. EN Interviews historically: Conscious Media / Camelot / Evolver only.",
};
results.push({ id: "yale_interview", title: yale.target, url: null, status: "MISS", chars: 0, notes: yale.notes });

const read = results.filter((r) => r.status === "READ");
const thin = results.filter((r) => String(r.status).startsWith("THIN"));
const miss = results.filter((r) => r.status === "MISS" || r.status === "THIN/MISS");
const skipped = results.filter((r) => r.status === "SKIP_PRIORITY");

const report = {
  generatedAt: new Date().toISOString(),
  zone: "Asia/Shanghai",
  summary: {
    queued: QUEUE.length,
    READ: read.length,
    THIN: thin.length,
    MISS: miss.length,
    SKIP_PRIORITY: skipped.length,
    readChars: read.reduce((a, b) => a + (b.chars || 0), 0),
  },
  yale,
  results,
};
fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.md"), buildMd(report), "utf8");
fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.json"), JSON.stringify(report, null, 2), "utf8");
console.log("\nSUMMARY", report.summary);

function buildMd(report) {
  const lines = [];
  lines.push("# 12-site-rest-coverage");
  lines.push("");
  lines.push("generated: " + report.generatedAt + " (UTC) / Asia/Shanghai");
  lines.push("");
  lines.push("Rule: READ only if extract body >= 2000 chars of real text (not nav).");
  lines.push("");
  lines.push("| status | chars | title | id |");
  lines.push("|---|---:|---|---|");
  for (const r of report.results.filter((x) => x.status !== "SKIP_PRIORITY").sort((a, b) => (b.chars || 0) - (a.chars || 0))) {
    lines.push(`| ${r.status} | ${r.chars || 0} | ${r.pageTitle || r.title} | ${r.id} |`);
  }
  lines.push("");
  lines.push("## Yale");
  lines.push(`- **${report.yale.status}**: ${report.yale.notes}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(JSON.stringify(report.summary));
  lines.push("");
  return lines.join("\n");
}
