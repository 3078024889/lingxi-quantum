import type {MetadataRoute} from "next";
import {seoSiteForBuild} from "@/lib/seo/siai-domain-policy";

// robots.txt is build-static: each domain build supplies its own allowlisted origin.
// Avoid request-time headers() so the Cloudflare Worker can serve this route as an asset.
export const dynamic = "force-static";

export default function robots():MetadataRoute.Robots{
  const site=seoSiteForBuild(process.env.NEXT_PUBLIC_SITE_URL);
  return {
    rules:[{
      userAgent:"*",
      allow:"/",
      disallow:["/api/","/admin","/tools/admin","/tools/burn-after-read/","/share/"]
    }],
    sitemap:site+"/sitemap.xml",
    host:site
  };
}
