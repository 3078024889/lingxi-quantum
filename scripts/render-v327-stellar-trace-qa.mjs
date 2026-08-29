#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright");
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "output", "pdf");
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", args: ["--disable-gpu", "--disable-dev-shm-usage"] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000/stellar-trace", { waitUntil: "networkidle" });
  await page.fill('input[name="name"]', "星迹验收样本");
  await page.fill('input[name="birthDate"]', "1990-05-01");
  await page.fill('input[name="birthTime"]', "08:30");
  await page.fill('input[name="lastContactAt"]', "2026-08-28T18:30");
  await page.fill('input[name="lastKnownLat"]', "31.2304");
  await page.fill('input[name="lastKnownLon"]', "121.4737");
  await page.fill('textarea[name="context"]', "最后一次有效信息为文字联系；本样本仅用于页面与 PDF 验收。");
  await page.check('input[name="consent"]');
  await page.click('button:has-text("展开第一次联合推演")');
  await page.waitForSelector("#stellar-result", { state: "visible" });
  const pages = await page.locator("#stellar-result .lx-pdf-page").count();
  if (pages !== 2) throw new Error(`expected 2 result pages, got ${pages}`);
  const clipped = await page.locator("#stellar-result .lx-pdf-page").evaluateAll((items) => items.some((item) => getComputedStyle(item).overflow === "hidden" && item.scrollHeight > item.clientHeight + 2));
  if (clipped) throw new Error("responsive result page clips overflowing copy");
  await page.screenshot({ path: path.join(outDir, "v327-stellar-trace-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 900, height: 1200 });
  const downloadPromise = page.waitForEvent("download", { timeout: 120000 });
  await page.click('button:has-text("下载 2 页 PDF")');
  const download = await downloadPromise;
  const pdfPath = path.join(outDir, "v327-stellar-trace-qa.pdf");
  await download.saveAs(pdfPath);
  const size = fs.statSync(pdfPath).size;
  if (size < 100000) throw new Error(`PDF unexpectedly small: ${size}`);
  console.log(`PASS stellar trace mobile view and 2-page PDF download (${size} bytes)`);
} finally {
  await browser.close();
}
