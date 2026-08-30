#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright");
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "output", "pdf");
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", args: ["--disable-gpu", "--disable-dev-shm-usage"] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/stellar-trace`, { waitUntil: "networkidle" });
  await page.locator('label:has-text("寻踪对象姓名") input').fill("星迹验收样本");
  await page.locator('label:has-text("真实出生日期") input').fill("1990-05-01");
  await page.locator('label:has-text("出生时间") input').fill("08:30");
  await page.locator('label:has-text("出生地点") input').fill("上海");
  await page.locator('label:has-text("最后有效联系时间") input').fill("2026-08-28T18:30");
  await page.locator('label:has-text("最后已知位置") input').fill("上海市中心验收坐标");
  await page.locator('label:has-text("最后已知纬度") input').fill("31.2304");
  await page.locator('label:has-text("最后已知经度") input').fill("121.4737");
  await page.locator('label:has-text("最后一次已知移动方向") input').fill("向北");
  await page.locator('label:has-text("最后一次有效信息") textarea').fill("最后一次有效信息为文字联系；本样本仅用于页面与 PDF 验收。");
  await page.check('form input[type="checkbox"]');
  await page.click('button:has-text("展开四证合度")');
  await page.waitForSelector("#stellar-result", { state: "visible" });
  await page.waitForFunction(() => document.querySelector('[data-stellar-visualization="live"]')?.getAttribute("data-phase") === "4", null, { timeout: 10000 });
  const liveVisuals = await page.locator('[data-stellar-visualization="live"]').count();
  const printVisuals = await page.locator('[data-stellar-visualization="print"]').count();
  if (liveVisuals !== 1 || printVisuals !== 1) throw new Error(`expected shared live/print visualization, got ${liveVisuals}/${printVisuals}`);
  for (const stage of ["01 · 定时", "02 · 落证", "03 · 合度", "04 · 显域"]) if (!(await page.locator('[data-stellar-visualization="live"]').innerText()).includes(stage)) throw new Error(`missing stage ${stage}`);
  const pages = await page.locator("#stellar-result .lx-pdf-page").count();
  if (pages !== 2) throw new Error(`expected 2 result pages, got ${pages}`);
  const clipped = await page.locator("#stellar-result .lx-pdf-page").evaluateAll((items) => items.some((item) => getComputedStyle(item).overflow === "hidden" && item.scrollHeight > item.clientHeight + 2));
  if (clipped) throw new Error("responsive result page clips overflowing copy");
  const reportText = await page.locator("#stellar-result").innerText();
  if (!reportText.includes("四证合度") || !reportText.includes("九域据链 · 推演边界") || !reportText.includes("候选坐标尚未成域")) throw new Error("V328.1 publication language is missing from the report");
  if (/方向资格检验|证据链与停止条件|\bMissing\b|次簇/.test(reportText)) throw new Error("stale engineering language remains in the publication");
  if (/候选中心|搜索半径|\d+—\d+ km/.test(reportText)) throw new Error("report still exposes an unqualified point or kilometre band");
  await page.screenshot({ path: path.join(outDir, "v328-stellar-trace-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 900, height: 1200 });
  const downloadPromise = page.waitForEvent("download", { timeout: 120000 });
  await page.click('button:has-text("下载 2 页研究 PDF")');
  const download = await downloadPromise;
  const pdfPath = path.join(outDir, "v328-stellar-trace-qa.pdf");
  await download.saveAs(pdfPath);
  const size = fs.statSync(pdfPath).size;
  if (size < 100000) throw new Error(`PDF unexpectedly small: ${size}`);
  console.log(`PASS stellar trace mobile view and 2-page PDF download (${size} bytes)`);
} finally {
  await browser.close();
}
