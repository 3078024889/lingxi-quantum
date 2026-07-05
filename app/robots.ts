import type { MetadataRoute } from "next";

// 明确欢迎主流搜索引擎与 AI 抓取器（GEO 关键）：
// 让 ChatGPT / Claude / Gemini / Perplexity / 百度 / 字节 等都能抓取并引用灵犀。
const AI_AND_SEARCH_BOTS = [
  "GPTBot",            // OpenAI / ChatGPT
  "OAI-SearchBot",     // OpenAI 搜索
  "ChatGPT-User",      // ChatGPT 浏览
  "ClaudeBot",         // Anthropic / Claude
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",   // Gemini / Google AI
  "Googlebot",
  "Bingbot",
  "PerplexityBot",     // Perplexity
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "YouBot",
  "Baiduspider",       // 百度
  "Sogou web spider",  // 搜狗（微信搜一搜底层）
  "360Spider",
  "Bytespider",        // 字节 / 抖音 / 豆包
  "Yisouspider",       // 神马
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 通用：全部允许，仅屏蔽账户与接口
      { userAgent: "*", allow: "/", disallow: ["/account", "/api/"] },
      // 显式欢迎每一个 AI / 搜索抓取器
      ...AI_AND_SEARCH_BOTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/account", "/api/"],
      })),
    ],
    sitemap: "https://lingxifield.com/sitemap.xml",
    host: "https://lingxifield.com",
  };
}
