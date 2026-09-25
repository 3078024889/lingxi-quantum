import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { liveTools } from "@/lib/tools/registry";

async function resolveSite(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host") || "";
    if (host.includes("lingxifield.cn")) return "https://lingxifield.cn";
  } catch {}
  return "https://lingxifield.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site=await resolveSite();
  const routes=[
    "",
    "/products",
    "/explore",
    "/tools",
    "/sasi",
    "/sasi/pricing",
    "/ai-wallet",
    "/ai-knowledge",
    "/ai-learning",
    "/ai-research",
    "/about",
    "/terms",
    "/privacy",
    "/refunds",
    "/legal/sasi",
  ];
  const toolRoutes=liveTools().map(tool=>`/tools/${tool.slug}`);
  const uniqueRoutes=Array.from(new Set([...routes,...toolRoutes]));
  const now=new Date();
  return uniqueRoutes.map(route=>({
    url:`${site}${route}`,
    lastModified:now,
    changeFrequency:"weekly" as const,
    priority:route===""?1:route.startsWith("/tools/")?0.8:0.7,
  }));
}
