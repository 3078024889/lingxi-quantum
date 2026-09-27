import type {MetadataRoute} from "next";
import {SITE} from "@/lib/seo/global-seo";

const PRIVATE=["/account","/api/","/checkout","/checkout-usd","/paypal","/tools/admin","/tools/pay","/sasi/chat","/sasi/operator","/sasi/connections","/sasi/assemble"];

export default function robots():MetadataRoute.Robots{
 const agents=["*","Googlebot","Bingbot","Applebot","Baiduspider","OAI-SearchBot","GPTBot","PerplexityBot","ClaudeBot","Claude-SearchBot","Google-Extended"];
 return {rules:agents.map(userAgent=>({userAgent,allow:"/",disallow:PRIVATE})),sitemap:`${SITE}/sitemap.xml`};
}
