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
    const canvas = await html2canvas(chunk, { backgroundColor: bgColorHex, scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth - MARGIN * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const usableHeight = pageHeight - MARGIN * 2;

    if (imgHeight > usableHeight) {
      if (placedAnything) { pdf.addPage(); fillPageBackground(); cursorY = MARGIN; }
      let heightLeft = imgHeight;
      let position = MARGIN;
      pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
      while (heightLeft > 10) {
        position = MARGIN - (imgHeight - heightLeft);
        pdf.addPage(); fillPageBackground();
        pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }
      cursorY = MARGIN + (imgHeight % usableHeight || usableHeight);
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
  const bgHex = params.bgColorHex ?? "#0d0d1a";

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
    const canvas = await html2canvas(coverEl, { backgroundColor: bgHex, scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const y = Math.max(0, (pageHeight - imgHeight) / 2);
    pdf.addImage(imgData, "JPEG", 0, y, imgWidth, Math.min(imgHeight, pageHeight));
  }

  // ── 第二页：目录（直接画字，不截图） ──
  pdf.addPage();
  fillPageBackground();
  pdf.setTextColor(...AMBER_RGB);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("CONTENTS", MARGIN, 70);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text(reportTitleZh, MARGIN, 95);
  pdf.setTextColor(...LATTICE_RGB);
  pdf.setFontSize(11);
  pdf.text(reportTitleEn, MARGIN, 115);

  let tocY = 160;
  const tocLineHeight = 30;
  chapterTitles.forEach((ch, i) => {
    if (tocY > pageHeight - MARGIN) return;
    pdf.setTextColor(...BONE_DIM_RGB);
    pdf.setFontSize(9);
    pdf.text(String(i + 1).padStart(2, "0"), MARGIN, tocY);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.text(ch.titleZh, MARGIN + 30, tocY);
    pdf.setTextColor(...LATTICE_RGB);
    pdf.setFontSize(9);
    pdf.text(ch.titleEn, MARGIN + 30, tocY + 14);
    pdf.setDrawColor(60, 55, 80);
    pdf.line(MARGIN + 30, tocY + 20, pageWidth - MARGIN, tocY + 20);
    tocY += tocLineHeight;
  });

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

  for (const chapter of contentEls) {
    if (!chapter || chapter.offsetHeight < 2) continue;
    const canvas = await html2canvas(chapter, { backgroundColor: bgHex, scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth - MARGIN * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const usableHeight = pageHeight - MARGIN * 2;

    if (imgHeight > usableHeight) {
      if (placedAnythingOnPage) startNewContentPage();
      let heightLeft = imgHeight;
      let position = MARGIN;
      pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
      while (heightLeft > 10) {
        position = MARGIN - (imgHeight - heightLeft);
        pdf.addPage();
        fillPageBackground();
        contentPageNumbers.push(pdf.getNumberOfPages());
        pdf.addImage(imgData, "JPEG", MARGIN, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }
      cursorY = MARGIN + (imgHeight % usableHeight || usableHeight);
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
