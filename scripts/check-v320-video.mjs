import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright");
const videoUrl = process.env.VIDEO_URL || "http://127.0.0.1:8765/media/lingxifield-9d-field-structure-v320.mp4";
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage();
await page.setContent(`<video id="field-video" muted autoplay playsinline><source src="${videoUrl}" type="video/mp4"></video>`);
await page.waitForTimeout(4000);
const state = await page.locator("#field-video").evaluate((video) => ({
  readyState: video.readyState,
  networkState: video.networkState,
  error: video.error ? { code: video.error.code, message: video.error.message } : null,
  duration: video.duration,
  width: video.videoWidth,
  height: video.videoHeight,
  currentTime: video.currentTime,
  paused: video.paused,
}));
await browser.close();
if (state.error || state.readyState < 3 || state.currentTime <= 0 || state.paused) throw new Error(`video playback failed: ${JSON.stringify(state)}`);
console.log(`PASS V320 video playback ${state.width}x${state.height}, ${state.duration.toFixed(1)}s, readyState=${state.readyState}`);
