#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright");
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "output", "pdf");
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3001";
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", args: ["--disable-gpu", "--disable-dev-shm-usage"] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(String(error?.stack || error)));
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.goto(`${baseUrl}/stellar-trace`, { waitUntil: "networkidle" });
  const text = await page.locator("main").innerText();
  for (const token of ["灵犀场星迹 · 万里寻踪", "循时而索迹，因星而见位。", "九域坐标", "寻踪档案", "行迹锚点", "7 天内有效"]) if (!text.includes(token)) throw new Error(`public intake missing ${token}`);
  const button = page.locator('button:has-text("确认边界并开启")');
  if (!(await button.isDisabled())) throw new Error("payment entry must stay disabled before required intake");
  await page.locator('label:has-text("寻踪对象姓名") input').fill("支付前建档验收");
  await page.locator('label:has-text("真实出生日期") input').fill("1990-05-01");
  await page.locator('label:has-text("最后有效联系时间") input').fill("2026-08-29T18:30");
  await page.locator('label:has-text("最后已知位置") input').fill("上海市验收坐标");
  await page.locator('label:has-text("最后已知纬度") input').fill("31.2304");
  await page.locator('label:has-text("最后已知经度") input').fill("121.4737");
  const boundaryText = await page.locator("form").innerText();
  for (const token of ["支付前结果边界", "不保证形成唯一候选坐标", "尚未成域", "《退款政策》"]) if (!boundaryText.includes(token)) throw new Error(`payment boundary missing ${token}`);
  const confirmations = page.locator('form input[type="checkbox"]');
  if (await confirmations.count() < 2) throw new Error("Stellar Trace needs separate boundary and source confirmations");
  await confirmations.nth(0).check();
  if (!(await button.isDisabled())) throw new Error("one confirmation must not unlock payment");
  await confirmations.nth(1).check();
  if (await button.isDisabled()) throw new Error("complete intake did not unlock the payment entry");
  await page.screenshot({ path: path.join(outDir, "v3281-stellar-intake-mobile.png"), fullPage: true });
  await button.click();
  await page.waitForURL(/\/checkout\?.*productId=stellar-trace/, { timeout: 10000 });
  const stored = await page.evaluate(() => window.localStorage.getItem("lingxifield:stellar-trace:draft:v1"));
  if (!stored || !stored.includes("支付前建档验收")) throw new Error("intake was not preserved before checkout");

  await page.evaluate(() => { window.localStorage.clear(); window.name = ""; });
  await page.goto(`${baseUrl}/checkout?productId=stellar-trace&redirect=%2Fstellar-trace&intake=complete`, { waitUntil: "domcontentloaded" });
  try { await page.waitForURL(/\/stellar-trace\?intake=required/, { timeout: 20000 }); }
  catch {
    const diagnostics = await page.evaluate(() => ({ url: location.href, draft: localStorage.getItem("lingxifield:stellar-trace:draft:v1"), windowName: window.name, text: document.body.innerText.slice(0, 500) }));
    diagnostics.browserErrors = browserErrors;
    throw new Error(`direct checkout guard failed: ${JSON.stringify(diagnostics)}`);
  }
  console.log("PASS Stellar Trace requires a complete archive before checkout and preserves the draft securely off-URL");
} finally { await browser.close(); }
