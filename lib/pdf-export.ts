// ────────────────────────────────────────────────────────────────────
// 灵犀 · 共用PDF报告导出工具
// ────────────────────────────────────────────────────────────────────
// 之前四个产品（生命图谱、关系共振、生命灵签、塔罗生命镜像）各自维护
// 一份几乎一模一样的PDF导出代码，这次抽成一份共用的，順便把"精美"这
// 件事做扎实：加了目录页、每页统一的页眉页脚、页码——封面和正文内容
// 还是用截图的方式（因为要保留极光玻璃背景这套视觉，直接截取真实
// 渲染出来的网页最简单可靠，不用在PDF库里重新画一遍渐变和模糊效果），
// 但目录页、页码这些纯文字/纯排版的部分，改成用jsPDF直接画字，不
// 用截图——这样目录页字体清晰、不会因为截图缩放而模糊。

const PRINT_BG_RGB: [number, number, number] = [13, 13, 26]; // 对应 #0d0d1a，全站深色底的同一个颜色
const AMBER_RGB: [number, number, number] = [232, 183, 101]; // 对应品牌金色 amber
const LATTICE_RGB: [number, number, number] = [199, 156, 255]; // 对应品牌紫色 lattice
const BONE_DIM_RGB: [number, number, number] = [168, 168, 190]; // 偏灰的正文色

// v234：这是"PDF只有封面用上了背景图、后面的章节全被纯色盖住"这个
// 问题的真正根因——html2canvas 截图的时候，如果元素的CSS背景图片
// （无论是<img>标签还是style里的background-image）这时候还没真正
// 加载完成，html2canvas会截出一片空白或者干脆用上面传的bgColor
// 纯色兜底，而不是等图片加载好了再截。封面因为在页面最上面、用户
// 点下载按钮之前肉眼就已经看到它了，图片早就加载完了，所以封面
// 总是正常；后面的章节背景图，是随着导出流程往下截图才第一次真正
// 触发浏览器去请求这张图片，根本来不及在html2canvas截图那一刻加载
// 完——这不是"背景色覆盖了模板"，是图片压根还没下载完，截图截到的
// 是"图片还没出现"那一瞬间。
// 修复方式：在对某个元素调用html2canvas之前，先明确等它内部所有
// <img>标签和CSS背景图片都真正加载完成，再截图。
async function waitForImages(el: HTMLElement): Promise<void> {
  const promises: Promise<void>[] = [];

  const imgTags = Array.from(el.querySelectorAll("img"));
  for (const img of imgTags) {
    if (!img.complete) {
      promises.push(
        new Promise((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true }); // 加载失败也不要卡住整个导出流程
        })
      );
    }
  }

  const allEls = [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))];
  const seenUrls = new Set<string>();
  for (const node of allEls) {
    const bg = node.style.backgroundImage || getComputedStyle(node).backgroundImage;
    const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
    const url = match?.[1];
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      promises.push(
        new Promise((resolve) => {
          const preloader = new Image();
          preloader.onload = () => resolve();
          preloader.onerror = () => resolve();
          preloader.src = url;
        })
      );
    }
  }

  if (promises.length > 0) await Promise.all(promises);
}

export type PdfChapterMeta = { titleZh: string; titleEn: string };

// 给桃花磁场、生命韧性指数、今日运势这类"单屏即时结果"用的轻量版
// 导出——不需要封面页、不需要目录，直接把结果区域按需要分页截图，
// 配合每个产品自己的主题色（比如桃花磁场用粉色调，不是全站统一的
// 深蓝）。
export async function exportSimplePdf(params: {
  containerRef: HTMLElement;
  fileName: string;
  bgColorRgb: [number, number, number];
  bgColorHex: string;
}): Promise<void> {
  const { containerRef, fileName, bgColorRgb, bgColorHex } = params;

  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 200));

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const MARGIN = 32;

  const fillPageBackground = () => {
    pdf.setFillColor(...bgColorRgb);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  };
  fillPageBackground();

  const children = Array.from(containerRef.children) as HTMLElement[];
  let cursorY = MARGIN;
  let placedAnything = false;

  for (const chunk of children) {
    if (!chunk || chunk.offsetHeight < 2) continue;
    await waitForImages(chunk);
    const canvas = await html2canvas(chunk, { backgroundColor: bgColorHex, scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth - MARGIN * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const usableHeight = pageHeight - MARGIN * 2;

    if (imgHeight > usableHeight) {
      if (placedAnything) { pdf.addPage(); fillPageBackground(); }
      // 同exportGlassPdf里的注释：这里故意用pageHeight（整页高度）
      // 推进，不用usableHeight（页高减边距）——jsPDF实际按整页物理
      // 边界裁切图片，不会在底部自动扣掉边距，用usableHeight推进会
      // 导致每页实际前进的距离比真实裁切范围小，下一页开头重复出现
      // 上一页已经露出过的内容。
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 10) {
        position = -(imgHeight - heightLeft);
        pdf.addPage(); fillPageBackground();
        pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      // 最后一页顶部可能还留着不到10px的图片尾巴，不当成"完全空白"，
      // 下一块内容从稍微往下一点的位置开始，避免贴在一起。
      cursorY = 20;
      placedAnything = true;
      continue;
    }

    if (placedAnything && cursorY + imgHeight > pageHeight - MARGIN) {
      pdf.addPage(); fillPageBackground(); cursorY = MARGIN;
    }
    pdf.addImage(imgData, "JPEG", MARGIN, cursorY, imgWidth, imgHeight);
    cursorY += imgHeight + 14;
    placedAnything = true;
  }

  // v227：之前这个导出函数（今日运势/生命韧性指数/桃花磁场指数用的
  // 这一份）完全没有盖网址，跟另一个导出函数（生命图谱/生命灵签/
  // 关系共振/量子塔罗用的那一份）不一致。统一在保存前，给这份PDF
  // 产生的每一页都盖上网址。
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 146, 168);
    pdf.text(`lingxifield.com`, MARGIN, pageHeight - 14);
  }

  pdf.save(fileName);
}


export async function exportGlassPdf(params: {
  containerRef?: HTMLElement; // 简单场景：直接传整个容器，工具自己把第一个直接子元素当封面、其余当正文
  coverEl?: HTMLElement; // 精细场景：调用方已经自己确定好封面元素和正文章节数组，不想被重新拆分（比如章节分组本身经过特殊调优，不想被这个工具的默认规则打乱）
  chapterEls?: HTMLElement[];
  fileName: string;
  reportTitleZh: string;
  reportTitleEn: string;
  chapterTitles: PdfChapterMeta[];
  bgColorRgb?: [number, number, number]; // 不同产品各自已经设计好的印刷底色不一样（life-map是紫色系渐变、qian/tarot是深蓝），不强行统一，默认用qian/tarot那个深蓝
  bgColorHex?: string; // html2canvas截图时需要的十六进制版本，要跟上面的rgb对应同一个颜色
}): Promise<void> {
  const { fileName, reportTitleZh, reportTitleEn, chapterTitles } = params;
  const bgRgb = params.bgColorRgb ?? PRINT_BG_RGB;
  // v296：默认底色从深色 #0d0d1a 改为浅色。新 PDF 素材是浅色晨雾水彩，
  // 深色底会让截图边缘出现黑框，跟素材冲突。
  const bgHex = params.bgColorHex ?? "#F6F4F0";

  let coverEl: HTMLElement | undefined;
  let contentEls: HTMLElement[];
  if (params.coverEl || params.chapterEls) {
    coverEl = params.coverEl;
    contentEls = params.chapterEls ?? [];
  } else if (params.containerRef) {
    const children = Array.from(params.containerRef.children) as HTMLElement[];
    [coverEl, ...contentEls] = children;
  } else {
    throw new Error("exportGlassPdf: 必须提供 containerRef，或者 coverEl+chapterEls");
  }

  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 200));

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const MARGIN = 36;

  const fillPageBackground = () => {
    pdf.setFillColor(...bgRgb);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const contentPageNumbers: number[] = [];

  // ── 第一页：封面（截图） ──
  fillPageBackground();
  if (coverEl && coverEl.offsetHeight > 2) {
    await waitForImages(coverEl);
    const canvas = await html2canvas(coverEl, { backgroundColor: bgHex, scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const y = Math.max(0, (pageHeight - imgHeight) / 2);
    pdf.addImage(imgData, "JPEG", 0, y, imgWidth, Math.min(imgHeight, pageHeight));
  }
  // v227：之前只有正文页盖了网址，封面和目录页没有——万一用户只把
  // 封面那一页截图分享出去，上面完全没有 lingxifield.com 这几个字。
  // 现在每一页，不管封面、目录、正文，都统一盖上网址。
  pdf.setFontSize(8);
  pdf.setTextColor(150, 146, 168);
  pdf.text(`lingxifield.com`, MARGIN, pageHeight - 20);

  // ── 第二页：目录 ──
  // 之前这里直接用jsPDF自带的Helvetica字体画中文字——Helvetica这个
  // 字体根本没有中文字形，画出来必然是乱码或者空白方块，这正是
  // "目录页乱码"的真正原因，不是内容或者编码设置的问题，是选错了
  // 渲染方式。改成跟封面、正文完全一样的做法：先在一个不显示在
  // 页面上的临时容器里，用网页真实加载的字体把目录排好版，截图，
  // 再把这张图贴进PDF——不再依赖jsPDF自己画字，彻底避开字体缺字
  // 这个坑。
  const tocContainer = document.createElement("div");
  tocContainer.style.position = "fixed";
  tocContainer.style.left = "-9999px";
  tocContainer.style.top = "0";
  tocContainer.style.width = "800px";
  tocContainer.style.padding = "56px 48px";
  tocContainer.style.fontFamily = "var(--font-body, sans-serif)";
  tocContainer.innerHTML = `
    <p style="margin:0;font-family:var(--font-display, serif);font-size:15px;letter-spacing:.15em;text-transform:uppercase;color:rgb(${AMBER_RGB.join(",")})">CONTENTS</p>
    <h1 style="margin:14px 0 0;font-family:var(--font-display, serif);font-weight:300;font-size:30px;color:#ffffff;">${reportTitleZh}</h1>
    <p style="margin:6px 0 0;font-family:var(--font-display, serif);font-size:15px;color:rgb(${LATTICE_RGB.join(",")})">${reportTitleEn}</p>
    <div style="margin-top:36px;">
      ${chapterTitles
        .map(
          (ch, i) => `
        <div style="display:flex;align-items:baseline;gap:18px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="flex:none;width:22px;font-size:12px;color:rgb(${BONE_DIM_RGB.join(",")})">${String(i + 1).padStart(2, "0")}</span>
          <div>
            <div style="font-family:var(--font-display, serif);font-size:17px;color:#ffffff;">${ch.titleZh}</div>
            <div style="margin-top:2px;font-size:11px;color:rgb(${LATTICE_RGB.join(",")})">${ch.titleEn}</div>
          </div>
        </div>`
        )
        .join("")}
    </div>
  `;
  document.body.appendChild(tocContainer);
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 80));

  pdf.addPage();
  fillPageBackground();
  try {
    const tocCanvas = await html2canvas(tocContainer, { backgroundColor: bgHex, scale: 2, useCORS: true });
    const tocImgData = tocCanvas.toDataURL("image/jpeg", 0.92);
    const tocImgWidth = pageWidth;
    const tocImgHeight = Math.min((tocCanvas.height * tocImgWidth) / tocCanvas.width, pageHeight);
    pdf.addImage(tocImgData, "JPEG", 0, 0, tocImgWidth, tocImgHeight);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 146, 168);
    pdf.text(`lingxifield.com`, MARGIN, pageHeight - 20);
  } finally {
    document.body.removeChild(tocContainer);
  }

  // ── 正文内容（每个章节截图，逐张贴进页面） ──
  pdf.addPage();
  fillPageBackground();
  contentPageNumbers.push(pdf.getNumberOfPages());
  let cursorY = MARGIN;
  let placedAnythingOnPage = false;

  const startNewContentPage = () => {
    pdf.addPage();
    fillPageBackground();
    contentPageNumbers.push(pdf.getNumberOfPages());
    cursorY = MARGIN;
    placedAnythingOnPage = false;
  };

  // v226：之前"内容/图表被截断"的真正原因——每个章节是整块截图成一张
  // 图，如果这张图比一页还高，就靠下面的循环机械地按"页面还剩多少
  // 高度"来裁切，裁切点完全不管这里是不是一句话中间、是不是一个分数
  // 条的中间，切在哪算哪。这里改成"先拆、再截图"：在真正截图之前，
  // 先检查这个章节渲染出来是不是明显超高，超高就把里面的正文段落
  // （用 whitespace-pre-line 渲染的那一段）按句子重新分组，拆成几个
  // 分别都截图的小块——只允许在"句子与句子之间"分页，不允许在"一句
  // 话内部"分页。找不到可拆的正文（比如这个章节主要是图表而不是长
  // 文字）就保底整块处理，不强拆。
  const SAFE_CHAPTER_HEIGHT_PX = 900;

  const splitTallChapter = (chapter: HTMLElement): { pieces: HTMLElement[]; cleanup: HTMLElement[] } => {
    if (chapter.offsetHeight <= SAFE_CHAPTER_HEIGHT_PX) return { pieces: [chapter], cleanup: [] };

    const paragraph = chapter.querySelector<HTMLElement>(".whitespace-pre-line");
    if (!paragraph || !paragraph.textContent || !paragraph.textContent.trim()) {
      return { pieces: [chapter], cleanup: [] };
    }

    const sentences = paragraph.textContent.match(/[^。！？.!?]+[。！？.!?]?/g)?.filter((s) => s.trim()) ?? [];
    if (sentences.length <= 1) return { pieces: [chapter], cleanup: [] };

    const GROUP_SIZE = 5; // 大约每 5 句一块——这个粒度下，单块基本不可能还超过一页
    const groups: string[] = [];
    for (let i = 0; i < sentences.length; i += GROUP_SIZE) {
      groups.push(sentences.slice(i, i + GROUP_SIZE).join("").trim());
    }
    if (groups.length <= 1) return { pieces: [chapter], cleanup: [] };

    const pieces: HTMLElement[] = [];
    groups.forEach((text, idx) => {
      const clone = chapter.cloneNode(true) as HTMLElement;
      const cloneParagraph = clone.querySelector<HTMLElement>(".whitespace-pre-line");
      if (cloneParagraph) cloneParagraph.textContent = text;
      // 只有第一小块保留标题/徽标这类非正文元素，后面的小块只留正文，
      // 避免同一个章节标题在页面里重复出现好几次。
      if (idx > 0 && cloneParagraph) {
        Array.from(clone.children).forEach((child) => {
          if (child !== cloneParagraph) child.remove();
        });
      }
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = `${chapter.offsetWidth}px`;
      document.body.appendChild(clone);
      pieces.push(clone);
    });
    return { pieces, cleanup: pieces };
  };

  for (const chapter of contentEls) {
    if (!chapter || chapter.offsetHeight < 2) continue;
    const { pieces, cleanup } = splitTallChapter(chapter);
    for (const piece of pieces) {
    await waitForImages(piece);
    const canvas = await html2canvas(piece, { backgroundColor: bgHex, scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth - MARGIN * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const usableHeight = pageHeight - MARGIN * 2;

    if (imgHeight > usableHeight) {
      if (placedAnythingOnPage) startNewContentPage();
      // 这里跨页切割的推进量，故意不用usableHeight（页高减去上下
      // 边距），而是用pageHeight本身——jsPDF实际按整页物理边界
      // （0到pageHeight）裁切图片，不会在底部自动扣掉边距，如果
      // 这里的"每页前进多少"算得比实际裁切范围小，下一页开头就会
      // 重新出现上一页已经露出过的那一小段内容，看起来就是"标题和
      // 一段话又出现了一次"——这正是之前"目录/正文重复"这个问题
      // 的真正根源，不是内容生成重复，是切图的时候切错了。
      // 走到这条分支，说明即使按句子拆过了，单独一小块仍然超过一页
      // （比如一句话本身就特别长，或者这块里嵌了一张大图/图表），
      // 这种情况非常少见，保留机械裁切作为兜底，不会崩溃，只是不能
      // 保证百分百不切在内容中间。
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 10) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        fillPageBackground();
        contentPageNumbers.push(pdf.getNumberOfPages());
        pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      // 最后一页顶部可能还留着不到10px的图片尾巴（heightLeft<=10那
      // 一点点），不能当成"这页完全空白"处理，下一个章节从稍微
      // 往下一点的位置开始，避免跟这一点残留内容贴在一起。
      cursorY = 24;
      placedAnythingOnPage = true;
      continue;
    }

    if (placedAnythingOnPage && cursorY + imgHeight > pageHeight - MARGIN) {
      startNewContentPage();
    }
    pdf.addImage(imgData, "JPEG", MARGIN, cursorY, imgWidth, imgHeight);
    cursorY += imgHeight + 18;
    placedAnythingOnPage = true;
    }
    cleanup.forEach((el) => el.remove());
  }

  // ── 统一给正文页加页脚：页码 + 网址 ──
  contentPageNumbers.forEach((pageNo, idx) => {
    pdf.setPage(pageNo);
    pdf.setFontSize(8);
    pdf.setTextColor(120, 118, 140);
    pdf.text(`lingxifield.com`, MARGIN, pageHeight - 20);
    pdf.text(`${idx + 1} / ${contentPageNumbers.length}`, pageWidth - MARGIN - 30, pageHeight - 20);
  });

  pdf.save(fileName);
}

// ════════════════════════════════════════════════════════════════
// v290：档案式 PDF 导出 —— 每章独立成页，PDF 原图铺满整页
// ════════════════════════════════════════════════════════════════
// 之前的导出方式是 html2canvas 把网页整段截图、再按高度切片贴进
// jsPDF。三个后果：
//   1. 图片被 MARGIN 裁掉，看不到 PDF 原图的完整画面
//   2. 页面底色用写死的深色（生命韧性传的是墨绿 [9,37,31]），
//      跟现在的浅色新素材冲突，WPS 里打开就是一片发黑
//   3. 一页塞两三章，内容密度看起来很低，像"漂亮电子书"
//      而不是"个人档案"
//
// 这一版换成真正的档案排版：
//   · 每一章独立占满一页 A4
//   · 该章对应的 PDF 原图作整页背景（不裁切、不留白边）
//   · 文字压在一块玻璃面板上，面板本身半透明，图透得出来
//   · 图按章循环使用（素材 6 张，正文用 page-1..4 循环）
//
// 关键实现细节：文字不再走 html2canvas 截图，改用 jsPDF 原生文本。
// 好处是文字保持矢量、可选中可搜索、缩放不糊；代价是要自己处理
// 中文断行——jsPDF 的 splitTextToSize 对中文支持不好，所以下面
// 用按字符宽度估算的方式手动折行。

export async function exportArchivePdf(params: {
  chapters: { title: string; body: string }[];
  fileName: string;
  titleZh: string;
  titleEn: string;
  coverImage: string;
  bodyImages: string[];
  endImage: string;
  panelRgba?: [number, number, number, number];
  textRgb?: [number, number, number];
  titleRgb?: [number, number, number];
}): Promise<void> {
  const { chapters, fileName, titleZh, titleEn, coverImage, bodyImages, endImage } = params;

  // ⚠️ 为什么不用 jsPDF 原生文本：
  // jsPDF 内置字体只有 Helvetica/Times/Courier 这几种西文字体，
  // 没有任何中文字形。直接 pdf.text() 写中文，输出的是
  // "O`v„uT}—ç`'hchH" 这类乱码——上一版就是栽在这里。
  // 要用原生文本必须先嵌入中文字体文件（Noto Sans SC 约 8–10MB），
  // 那会让首次下载 PDF 时多加载 10MB，移动端体验很差。
  //
  // 所以改用另一条路：在页面外构建一个真正的 A4 尺寸 DOM，
  // 用浏览器自己的字体渲染（中文一定正确），再整页截图贴进 PDF。
  // 与旧方案的区别在于——旧方案截的是网页上那些小卡片，
  // 所以出来像"网页截图"；这里截的是专门为 A4 排好版的整页，
  // 背景图铺满、玻璃面板浮在上面，出来就是档案页。

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  await document.fonts.ready;

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();

  // A4 在 96dpi 下的像素尺寸，按 2 倍缩放渲染保证清晰度
  const PX_W = 794, PX_H = 1123;

  const stage = document.createElement("div");
  stage.style.cssText =
    `position:fixed;left:-99999px;top:0;width:${PX_W}px;height:${PX_H}px;overflow:hidden;`;
  document.body.appendChild(stage);

  const renderPage = async (html: string): Promise<string> => {
    stage.innerHTML = html;
    await waitForImages(stage);
    // 图片解码完成后再等一帧，否则偶发截到半张图
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
    const canvas = await html2canvas(stage, {
      width: PX_W, height: PX_H, scale: 2, useCORS: true, backgroundColor: "#F6F4F0",
    });
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  // 每章换一个纵向取景位，让 4 张图产生 12 种画面，11 章不重样
  const SHIFTS = ["center 12%", "center 50%", "center 88%"];

  const pageShell = (bg: string, pos: string, inner: string) => `
    <div style="position:relative;width:${PX_W}px;height:${PX_H}px;overflow:hidden;
                font-family:'Noto Serif SC','Songti SC','SimSun',serif;">
      <div style="position:absolute;inset:0;background-image:url('${bg}');
                  background-size:cover;background-position:${pos};"></div>
      ${inner}
    </div>`;

  // ── 封面 ──
  pdf.addImage(await renderPage(pageShell(coverImage, "center 40%", `
    <div style="position:absolute;left:56px;right:56px;top:34%;
                background:linear-gradient(135deg,rgba(80,150,180,.16),rgba(150,120,255,.10));border:1px solid rgba(200,235,225,.34);
                border-radius:6px;padding:46px 40px;text-align:center;
                box-shadow:0 18px 60px rgba(40,36,70,.18);">
      <div style="font-size:12px;letter-spacing:.4em;color:#7A6E94;">LINGXI FIELD</div>
      <div style="font-size:34px;color:#3A2E52;margin-top:18px;letter-spacing:.12em;">${titleZh}</div>
      <div style="font-size:13px;color:#6B6285;margin-top:14px;letter-spacing:.06em;">${titleEn}</div>
    </div>`)), "JPEG", 0, 0, PW, PH);

  // ── 正文：每章一页 ──
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const bg = bodyImages[i % bodyImages.length];
    const pos = SHIFTS[Math.floor(i / bodyImages.length) % SHIFTS.length];
    pdf.addPage();
    pdf.addImage(await renderPage(pageShell(bg, pos, `
      <div style="position:absolute;left:52px;right:52px;top:60px;
                  background:linear-gradient(135deg,rgba(80,150,180,.17),rgba(100,220,200,.09),rgba(150,120,255,.11));border:1px solid rgba(200,235,225,.34);
                  border-radius:6px;padding:38px 40px;
                  box-shadow:0 18px 56px rgba(40,36,70,.16);">
        <div style="font-size:11px;letter-spacing:.34em;color:#8C7FA8;">
          LIFE RESILIENCE · ${String(i + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}
        </div>
        <div style="font-size:23px;color:#3A2E52;margin:16px 0 6px;letter-spacing:.06em;">${ch.title}</div>
        <div style="width:52px;height:1px;background:#B9A6D6;margin-bottom:22px;"></div>
        <div style="font-size:14.5px;line-height:2.05;color:#2E2742;white-space:pre-wrap;">${
          ch.body.replace(/&/g, "&amp;").replace(/</g, "&lt;")
        }</div>
      </div>
      <div style="position:absolute;left:52px;bottom:26px;font-size:10px;color:#9990AE;">lingxifield.com</div>
      <div style="position:absolute;right:52px;bottom:26px;font-size:10px;color:#9990AE;">${i + 1} / ${chapters.length}</div>`
    )), "JPEG", 0, 0, PW, PH);
  }

  // ── 尾页 ──
  pdf.addPage();
  pdf.addImage(await renderPage(pageShell(endImage, "center 50%", "")), "JPEG", 0, 0, PW, PH);

  document.body.removeChild(stage);
  pdf.save(fileName);
}
