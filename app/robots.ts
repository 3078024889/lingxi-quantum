import type { MetadataRoute } from "next";

const SITE="https://lingxifield.com";

const PRIVATE=[
 "/account",
 "/api/",
 "/checkout",
 "/checkout-usd",
 "/paypal",
 "/tools/admin",
 "/tools/pay",
 "/sasi/chat",
 "/sasi/operator",
 "/sasi/connections",
 "/sasi/assemble",
];

export default function robots():MetadataRoute.Robots{
 return {
  rules:[
   {userAgent:"*",allow:"/",disallow:PRIVATE},
   {userAgent:"OAI-SearchBot",allow:"/",disallow:PRIVATE},
   {userAgent:"GPTBot",allow:"/",disallow:PRIVATE},
   {userAgent:"Googlebot",allow:"/",disallow:PRIVATE},
   {userAgent:"Bingbot",allow:"/",disallow:PRIVATE},
   {userAgent:"PerplexityBot",allow:"/",disallow:PRIVATE},
   {userAgent:"Applebot",allow:"/",disallow:PRIVATE},
   {userAgent:"Baiduspider",allow:"/",disallow:PRIVATE},
  ],
  sitemap:`${SITE}/sitemap.xml`,
 };
}
