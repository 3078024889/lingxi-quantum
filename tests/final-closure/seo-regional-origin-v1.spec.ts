import {test,expect} from "./export-test";
import {seoSiteForRequest} from "../../lib/seo/siai-domain-policy";

test("region is chosen from the allowlisted forwarded hostname, not the normalized Vercel internal host",()=>{
 expect(seoSiteForRequest("lingxifield.com","lingxifield.cn")).toBe("https://lingxifield.cn");
 expect(seoSiteForRequest("lingxifield.com","www.lingxifield.cn")).toBe("https://lingxifield.cn");
 expect(seoSiteForRequest("lingxifield.cn","lingxifield.com")).toBe("https://lingxifield.com");
 expect(seoSiteForRequest("lingxifield.cn",null)).toBe("https://lingxifield.cn");
 expect(seoSiteForRequest("lingxifield.com",null)).toBe("https://lingxifield.com");
});

test("unknown or hostile forwarded hosts never enter generated SEO URLs",()=>{
 for(const hostile of [
   "evil.invalid","evil.invalid,lingxifield.cn","lingxifield.cn.evil.invalid",
   "lingxifield.cn@evil.invalid","localhost","127.0.0.1","[::1]",
   "\r\nSitemap: https://evil.invalid/sitemap.xml"
 ])expect(seoSiteForRequest("lingxifield.com",hostile)).toBe("https://lingxifield.com");
 expect(seoSiteForRequest("evil.invalid","evil.invalid")).toBe("https://lingxifield.com");
});

test("real Next dynamic robots and sitemap share the forwarded .cn regional origin",async({request})=>{
 const headers={"x-forwarded-host":"lingxifield.cn"};
 const robots=await request.get("/robots.txt",{headers});
 expect(robots.status()).toBe(200);
 const text=await robots.text();
 expect(text).toContain("Sitemap: https://lingxifield.cn/sitemap.xml");
 expect(text).toContain("Host: https://lingxifield.cn");
 expect(text).not.toContain("Host: https://lingxifield.com");
 expect(text).not.toContain("Sitemap: https://lingxifield.com/sitemap.xml");
 const sitemap=await request.get("/sitemap.xml",{headers});
 expect(sitemap.status()).toBe(200);
 const xml=await sitemap.text();
 expect(xml).toContain("<urlset");
 const locs=Array.from(xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g),match=>match[1].trim());
 for(const loc of locs)expect(new URL(loc).origin,loc).toBe("https://lingxifield.cn");
 // The local/CI browser server may deliberately disable SIAI indexing.
 // If there are published entries, the regional SIAI URL must be included.
 // Production-only sitemap completeness is asserted by the separate
 // VERCEL_ENV=production SEO gate and post-deploy live-domain checker.
 if(locs.length)expect(locs).toContain("https://lingxifield.cn/siai");
 expect(locs).not.toContain("https://lingxifield.com/siai");
});
