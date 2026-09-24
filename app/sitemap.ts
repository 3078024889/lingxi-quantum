import type { MetadataRoute } from "next";
import { headers } from "next/headers";

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
  const now=new Date();
  return routes.map(route=>({
    url:`${site}${route}`,
    lastModified:now,
    changeFrequency:"weekly" as const,
    priority:route===""?1:0.7,
  }));
}
