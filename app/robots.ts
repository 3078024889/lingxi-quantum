import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const AI_BOTS = [
  "OAI-SearchBot","ChatGPT-User","GPTBot",
  "ClaudeBot","Claude-Web","anthropic-ai",
  "Googlebot","Google-Extended",
  "Bingbot","PerplexityBot","Perplexity-User",
  "Applebot","Applebot-Extended","Baiduspider","Bytespider"
];

async function site(){
  try{
    const h=await headers();
    const host=(h.get("host")||"").toLowerCase();
    if(host.includes("lingxifield.cn"))return "https://lingxifield.cn";
  }catch{}
  return "https://lingxifield.com";
}

export default async function robots():Promise<MetadataRoute.Robots>{
  const SITE=await site();
  return {
    rules:[
      {userAgent:"*",allow:"/",disallow:["/account","/api/","/tools/admin"]},
      ...AI_BOTS.map(userAgent=>({userAgent,allow:"/",disallow:["/account","/api/","/tools/admin"]}))
    ],
    sitemap:`${SITE}/sitemap.xml`,
    host:SITE,
  };
}
